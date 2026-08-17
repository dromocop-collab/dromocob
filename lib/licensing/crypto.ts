import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomBytes,
  sign,
  verify,
  type KeyObject,
} from "node:crypto";

import type {
  SignedReceipt,
  SignedReceiptPayload,
} from "./types";

export function sha256(
  value: string,
) {
  return createHash("sha256")
    .update(value, "utf8")
    .digest("hex");
}

export function normalizeLicenseKey(
  value: string,
) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function generateLicenseKey() {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const bytes = randomBytes(20);

  const body = Array.from(
    bytes,
    (byte) =>
      alphabet[
        byte % alphabet.length
      ],
  ).join("");

  return [
    "DROM",
    body.slice(0, 5),
    body.slice(5, 10),
    body.slice(10, 15),
    body.slice(15, 20),
  ].join("-");
}

export function licenseKeyHash(
  value: string,
) {
  return sha256(
    normalizeLicenseKey(value),
  );
}

export function canonicalReceipt(
  payload: SignedReceiptPayload,
) {
  return JSON.stringify({
    activationId:
      payload.activationId,

    deviceHash:
      payload.deviceHash,

    issuedAt:
      payload.issuedAt,

    licenseId:
      payload.licenseId,

    offlineUntil:
      payload.offlineUntil,

    plan:
      payload.plan,

    productId:
      payload.productId,

    receiptId:
      payload.receiptId,

    userId:
      payload.userId,

    validUntil:
      payload.validUntil,

    version:
      payload.version,
  });
}

// MARK: - PEM Helpers

function normalizePEM(
  value: string | undefined,
) {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();
}

function loadPrivateKey(): KeyObject {
  const raw = normalizePEM(
    process.env
      .DROMOCOB_LICENSE_PRIVATE_KEY,
  );

  if (!raw) {
    throw new Error(
      "LICENSE_SIGNING_KEY_NOT_CONFIGURED",
    );
  }

  try {
    const key = createPrivateKey({
      key: raw,
      format: "pem",
    });

    if (key.asymmetricKeyType !== "ec") {
      throw new Error(
        "LICENSE_PRIVATE_KEY_NOT_EC",
      );
    }

    return key;

  } catch (error) {
    console.error(
      "[LICENSE PRIVATE KEY ERROR]",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "LICENSE_PRIVATE_KEY_NOT_EC"
    ) {
      throw error;
    }

    throw new Error(
      "LICENSE_SIGNING_KEY_INVALID",
    );
  }
}

function loadPublicKey(): KeyObject {
  const configured = normalizePEM(
    process.env
      .DROMOCOB_LICENSE_PUBLIC_KEY,
  );

  try {
    const key = configured
      ? createPublicKey({
          key: configured,
          format: "pem",
        })
      : createPublicKey(
          loadPrivateKey(),
        );

    if (key.asymmetricKeyType !== "ec") {
      throw new Error(
        "LICENSE_PUBLIC_KEY_NOT_EC",
      );
    }

    return key;

  } catch (error) {
    console.error(
      "[LICENSE PUBLIC KEY ERROR]",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "LICENSE_PUBLIC_KEY_NOT_EC"
    ) {
      throw error;
    }

    throw new Error(
      "LICENSE_PUBLIC_KEY_INVALID",
    );
  }
}

// MARK: - Signing

export function signReceipt(
  payload: SignedReceiptPayload,
): SignedReceipt {
  const canonical =
    canonicalReceipt(payload);

  try {
    const signature = sign(
      "sha256",
      Buffer.from(
        canonical,
        "utf8",
      ),
      {
        key: loadPrivateKey(),

        dsaEncoding:
          "ieee-p1363",
      },
    ).toString(
      "base64url",
    );

    return {
      payload,
      signature,
      algorithm:
        "ES256",
    };

  } catch (error) {
    console.error(
      "[LICENSE SIGN ERROR]",
      error,
    );

    if (
      error instanceof Error &&
      [
        "LICENSE_SIGNING_KEY_NOT_CONFIGURED",
        "LICENSE_SIGNING_KEY_INVALID",
        "LICENSE_PRIVATE_KEY_NOT_EC",
      ].includes(
        error.message,
      )
    ) {
      throw error;
    }

    throw new Error(
      "LICENSE_RECEIPT_SIGN_FAILED",
    );
  }
}

// MARK: - Public Key

export function publicKeyPEM() {
  try {
    return loadPublicKey()
      .export({
        type: "spki",
        format: "pem",
      })
      .toString();

  } catch (error) {
    console.error(
      "[LICENSE PUBLIC KEY EXPORT ERROR]",
      error,
    );

    throw error;
  }
}

// MARK: - Receipt Verification

export function verifyReceipt(
  receipt: SignedReceipt,
) {
  if (
    receipt.algorithm !== "ES256" ||
    receipt.payload.version !== 1 ||
    !receipt.signature
  ) {
    return false;
  }

  try {
    return verify(
      "sha256",

      Buffer.from(
        canonicalReceipt(
          receipt.payload,
        ),
        "utf8",
      ),

      {
        key: loadPublicKey(),

        dsaEncoding:
          "ieee-p1363",
      },

      Buffer.from(
        receipt.signature,
        "base64url",
      ),
    );

  } catch (error) {
    console.error(
      "[LICENSE VERIFY ERROR]",
      error,
    );

    return false;
  }
}