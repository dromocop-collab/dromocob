import {
  FieldValue,
  Timestamp,
  type DocumentSnapshot,
} from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";

import { adminDb } from "@/lib/firebase-admin";
import {
  licenseKeyHash,
  signReceipt,
} from "./crypto";

import type {
  LicenseRecord,
  SignedReceiptPayload,
} from "./types";

type ActivationInput = {
  licenseKey: string;
  productId: string;
  deviceHash: string;
  deviceName: string;
  platform: string;
  appVersion: string;
  osVersion: string;
};

type AuthenticatedUser = {
  uid: string;
  email?: string;
};

const ALL_APPS_PRODUCT_ID =
  "dromocob-all-apps";

const SUPPORTED_PRODUCTS = new Set([
  ALL_APPS_PRODUCT_ID,
  "pixel-resizer-pro",
  "ai-upscaler",
  "background-remover",
  "watermark-studio",
  "image-compressor",
  "video-converter",
  "dromocob-ultra-ae",
]);

const FAR_FUTURE_DATE =
  "2099-12-31T23:59:59.000Z";

// MARK: - Normalization

function normalizeProductId(
  value: unknown
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeEmail(
  value: unknown
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function readLicense(
  snapshot: DocumentSnapshot
): LicenseRecord {
  const data = snapshot.data();

  if (!snapshot.exists || !data) {
    throw new Error(
      "INVALID_LICENSE"
    );
  }

  return data as LicenseRecord;
}

// MARK: - Input validation

function validateActivationInput(
  input: ActivationInput
): void {
  const licenseKey =
    String(input.licenseKey ?? "")
      .trim();

  const productId =
    normalizeProductId(
      input.productId
    );

  const deviceHash =
    String(input.deviceHash ?? "")
      .trim();

  if (
    !licenseKey ||
    licenseKey.length > 80
  ) {
    throw new Error(
      "INVALID_REQUEST"
    );
  }

  if (
    !productId ||
    productId.length > 80 ||
    !SUPPORTED_PRODUCTS.has(
      productId
    )
  ) {
    throw new Error(
      "INVALID_REQUEST"
    );
  }

  if (
    !/^[a-f0-9]{64}$/i.test(
      deviceHash
    )
  ) {
    throw new Error(
      "INVALID_REQUEST"
    );
  }
}

// MARK: - Expiration

function effectiveExpiry(
  license: LicenseRecord
): Date {
  if (
    license.plan === "lifetime"
  ) {
    return new Date(
      FAR_FUTURE_DATE
    );
  }

  if (!license.expiresAt) {
    return new Date(
      FAR_FUTURE_DATE
    );
  }

  return license.expiresAt.toDate();
}

// MARK: - Product access

function hasProductAccess(
  license: LicenseRecord,
  requestedProductId: string
): boolean {
  const requested =
    normalizeProductId(
      requestedProductId
    );

  const products =
    Array.isArray(
      license.products
    )
      ? license.products.map(
          item =>
            normalizeProductId(
              item
            )
        )
      : [];

  return (
    products.includes(
      ALL_APPS_PRODUCT_ID
    ) ||
    products.includes(requested)
  );
}

// MARK: - License validation

function assertLicense(
  license: LicenseRecord,
  productId: string,
  uid: string,
  email?: string
): void {
  if (
    license.status !== "active"
  ) {
    throw new Error(
      "LICENSE_INACTIVE"
    );
  }

  if (
    !hasProductAccess(
      license,
      productId
    )
  ) {
    throw new Error(
      "PRODUCT_NOT_INCLUDED"
    );
  }

  if (
    license.ownerUid &&
    license.ownerUid !== uid
  ) {
    throw new Error(
      "INVALID_LICENSE"
    );
  }

  const ownerEmail =
    normalizeEmail(
      license.ownerEmail
    );

  const userEmail =
    normalizeEmail(email);

  if (
    !ownerEmail ||
    !userEmail ||
    ownerEmail !== userEmail
  ) {
    throw new Error(
      "INVALID_LICENSE"
    );
  }

  const expiry =
    effectiveExpiry(license);

  if (
    expiry.getTime() <=
    Date.now()
  ) {
    throw new Error(
      "LICENSE_EXPIRED"
    );
  }
}

// MARK: - Receipt

function createReceiptPayload(
  license: LicenseRecord,
  licenseId: string,
  activationId: string,
  userId: string,
  productId: string,
  deviceHash: string
): SignedReceiptPayload {
  const now = new Date();

  const validUntil =
    effectiveExpiry(license);

  const offlineGraceDays =
    Math.max(
      1,
      Math.min(
        30,
        Number(
          license.offlineGraceDays
        ) || 7
      )
    );

  const graceUntil =
    new Date(
      now.getTime() +
        offlineGraceDays *
          86_400_000
    );

  const offlineUntil =
    new Date(
      Math.min(
        validUntil.getTime(),
        graceUntil.getTime()
      )
    );

  return {
    version: 1,
    receiptId:
      randomUUID(),
    licenseId,
    activationId,
    userId,
    productId:
      normalizeProductId(
        productId
      ),
    deviceHash,
    plan: license.plan,
    issuedAt:
      now.toISOString(),
    validUntil:
      validUntil.toISOString(),
    offlineUntil:
      offlineUntil.toISOString(),
  };
}

// MARK: - Activate

export async function activateLicense(
  input: ActivationInput,
  user: AuthenticatedUser
) {
  validateActivationInput(
    input
  );

  const productId =
    normalizeProductId(
      input.productId
    );

  const deviceHash =
    String(
      input.deviceHash
    ).trim();

  const keyHash =
    licenseKeyHash(
      input.licenseKey
    );

  return adminDb.runTransaction(
    async transaction => {
      const licenseQuery =
        adminDb
          .collection("licenses")
          .where(
            "keyHash",
            "==",
            keyHash
          )
          .limit(1);

      const licenseSnapshot =
        await transaction.get(
          licenseQuery
        );

      const licenseDoc =
        licenseSnapshot.docs[0];

      if (!licenseDoc) {
        throw new Error(
          "INVALID_LICENSE"
        );
      }

      const license =
        readLicense(
          licenseDoc
        );

      assertLicense(
        license,
        productId,
        user.uid,
        user.email
      );

      const activations =
        adminDb.collection(
          "license_activations"
        );

      const existingQuery =
        activations
          .where(
            "licenseId",
            "==",
            licenseDoc.id
          )
          .where(
            "deviceHash",
            "==",
            deviceHash
          )
          .where(
            "productId",
            "==",
            productId
          )
          .limit(1);

      const existingSnapshot =
        await transaction.get(
          existingQuery
        );

      const existingDoc =
        existingSnapshot.docs[0];

      let activationRef =
        existingDoc?.ref;

      if (!activationRef) {
        const activeQuery =
          activations
            .where(
              "licenseId",
              "==",
              licenseDoc.id
            )
            .where(
              "active",
              "==",
              true
            );

        const activeSnapshot =
          await transaction.get(
            activeQuery
          );

        /*
         Aynı fiziksel cihazdaki farklı
         Dromocob uygulamalarını ayrı cihaz
         olarak sayma.
        */
        const activeDevices =
          new Set(
            activeSnapshot.docs.map(
              document =>
                String(
                  document.data()
                    .deviceHash ??
                    ""
                )
            )
          );

        const maxDevices =
          Math.max(
            1,
            Number(
              license.maxDevices
            ) || 1
          );

        if (
          !activeDevices.has(
            deviceHash
          ) &&
          activeDevices.size >=
            maxDevices
        ) {
          throw new Error(
            "DEVICE_LIMIT_REACHED"
          );
        }

        activationRef =
          activations.doc();
      }

      const receiptPayload =
        createReceiptPayload(
          license,
          licenseDoc.id,
          activationRef.id,
          user.uid,
          productId,
          deviceHash
        );

      const receipt =
        signReceipt(
          receiptPayload
        );

      const previousCreatedAt =
        existingDoc?.data()
          .createdAt;

      transaction.set(
        activationRef,
        {
          licenseId:
            licenseDoc.id,

          userId:
            user.uid,

          userEmail:
            normalizeEmail(
              user.email
            ) ||
            normalizeEmail(
              license.ownerEmail
            ),

          productId,

          deviceHash,

          deviceName:
            String(
              input.deviceName ??
                ""
            ).slice(
              0,
              180
            ),

          platform:
            String(
              input.platform ??
                ""
            ).slice(
              0,
              60
            ),

          appVersion:
            String(
              input.appVersion ??
                ""
            ).slice(
              0,
              40
            ),

          osVersion:
            String(
              input.osVersion ??
                ""
            ).slice(
              0,
              80
            ),

          active: true,

          lastValidatedAt:
            FieldValue.serverTimestamp(),

          updatedAt:
            FieldValue.serverTimestamp(),

          createdAt:
            previousCreatedAt ??
            FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      transaction.set(
        adminDb
          .collection(
            "license_events"
          )
          .doc(),
        {
          type:
            existingDoc
              ? "reactivated"
              : "activated",

          licenseId:
            licenseDoc.id,

          activationId:
            activationRef.id,

          productId,

          userId:
            user.uid,

          deviceHash,

          createdAt:
            FieldValue.serverTimestamp(),
        }
      );

      if (!license.ownerUid) {
        transaction.update(
          licenseDoc.ref,
          {
            ownerUid:
              user.uid,

            updatedAt:
              FieldValue.serverTimestamp(),
          }
        );
      }

      return {
        receipt,
        activationId:
          activationRef.id,
        licenseId:
          licenseDoc.id,
      };
    }
  );
}

// MARK: - Validate

export async function validateActivation(
  activationId: string,
  productId: string,
  deviceHash: string,
  user: AuthenticatedUser
) {
  const normalizedProductId =
    normalizeProductId(
      productId
    );

  const normalizedDeviceHash =
    String(
      deviceHash ?? ""
    ).trim();

  if (
    !activationId ||
    !SUPPORTED_PRODUCTS.has(
      normalizedProductId
    ) ||
    !/^[a-f0-9]{64}$/i.test(
      normalizedDeviceHash
    )
  ) {
    throw new Error(
      "INVALID_REQUEST"
    );
  }

  const activationRef =
    adminDb
      .collection(
        "license_activations"
      )
      .doc(
        activationId
      );

  const activationSnapshot =
    await activationRef.get();

  const activation =
    activationSnapshot.data();

  if (
    !activationSnapshot.exists ||
    !activation ||
    activation.active !== true ||
    activation.userId !==
      user.uid ||
    normalizeProductId(
      activation.productId
    ) !==
      normalizedProductId ||
    activation.deviceHash !==
      normalizedDeviceHash
  ) {
    throw new Error(
      "INVALID_LICENSE"
    );
  }

  const activationLicenseId =
    String(
      activation.licenseId ??
        ""
    );

  if (!activationLicenseId) {
    throw new Error(
      "INVALID_LICENSE"
    );
  }

  const licenseSnapshot =
    await adminDb
      .collection(
        "licenses"
      )
      .doc(
        activationLicenseId
      )
      .get();

  const license =
    readLicense(
      licenseSnapshot
    );

  assertLicense(
    license,
    normalizedProductId,
    user.uid,
    user.email
  );

  const receiptPayload =
    createReceiptPayload(
      license,
      licenseSnapshot.id,
      activationId,
      user.uid,
      normalizedProductId,
      normalizedDeviceHash
    );

  const receipt =
    signReceipt(
      receiptPayload
    );

  await activationRef.update({
    lastValidatedAt:
      FieldValue.serverTimestamp(),

    updatedAt:
      FieldValue.serverTimestamp(),
  });

  return {
    receipt,
  };
}

// MARK: - Deactivate

export async function deactivateActivation(
  activationId: string,
  deviceHash: string,
  userId: string
) {
  const ref =
    adminDb
      .collection(
        "license_activations"
      )
      .doc(
        activationId
      );

  const snapshot =
    await ref.get();

  const data =
    snapshot.data();

  if (
    !snapshot.exists ||
    !data ||
    data.userId !==
      userId ||
    data.deviceHash !==
      deviceHash
  ) {
    throw new Error(
      "INVALID_LICENSE"
    );
  }

  await ref.update({
    active: false,

    deactivatedAt:
      FieldValue.serverTimestamp(),

    updatedAt:
      FieldValue.serverTimestamp(),
  });

  await adminDb
    .collection(
      "license_events"
    )
    .add({
      type:
        "deactivated",

      licenseId:
        data.licenseId,

      activationId,

      userId,

      deviceHash,

      createdAt:
        FieldValue.serverTimestamp(),
    });
}

// MARK: - Admin date parser

export function dateToTimestamp(
  value: unknown
): Timestamp | null {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const raw =
    String(value).trim();

  /*
   Admin panelindeki
   <input type="date">
   YYYY-MM-DD gönderir.

   Seçilen günün sonunda
   lisans bitsin.
  */
  const dateOnly =
    /^\d{4}-\d{2}-\d{2}$/.test(
      raw
    );

  const date =
    dateOnly
      ? new Date(
          `${raw}T23:59:59.999Z`
        )
      : new Date(raw);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      "INVALID_REQUEST"
    );
  }

  return Timestamp.fromDate(
    date
  );
}
