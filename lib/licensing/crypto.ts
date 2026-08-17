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

// ======================================================
// CONSTANTS
// ======================================================

const PRIVATE_KEY_ENV =
  "DROMOCOB_LICENSE_PRIVATE_KEY";

const PUBLIC_KEY_ENV =
  "DROMOCOB_LICENSE_PUBLIC_KEY";

const PRIVATE_HEADERS = [
  {
    begin: "-----BEGIN PRIVATE KEY-----",
    end: "-----END PRIVATE KEY-----",
  },
  {
    begin: "-----BEGIN EC PRIVATE KEY-----",
    end: "-----END EC PRIVATE KEY-----",
  },
] as const;

const PUBLIC_HEADER = {
  begin: "-----BEGIN PUBLIC KEY-----",
  end: "-----END PUBLIC KEY-----",
} as const;

// ======================================================
// BASIC CRYPTO
// ======================================================

export function sha256(
  value: string,
): string {
  return createHash("sha256")
    .update(value, "utf8")
    .digest("hex");
}

// ======================================================
// LICENSE KEY
// ======================================================

export function normalizeLicenseKey(
  value: string,
): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function generateLicenseKey(): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const bytes =
    randomBytes(20);

  const body =
    Array.from(
      bytes,
      byte =>
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
): string {
  return sha256(
    normalizeLicenseKey(value),
  );
}

// ======================================================
// CANONICAL RECEIPT
// ======================================================

export function canonicalReceipt(
  payload: SignedReceiptPayload,
): string {
  /*
   * Alan sırası SABİT kalmalı.
   *
   * Swift tarafındaki ReceiptVerifier
   * aynı canonical yapıyı kullanmalı.
   */
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

// ======================================================
// PEM NORMALIZATION
// ======================================================

function stripOuterQuotes(
  value: string,
): string {
  const trimmed =
    value.trim();

  if (
    (
      trimmed.startsWith("\"") &&
      trimmed.endsWith("\"")
    ) ||
    (
      trimmed.startsWith("'") &&
      trimmed.endsWith("'")
    )
  ) {
    return trimmed
      .slice(1, -1)
      .trim();
  }

  return trimmed;
}

function wrapBase64(
  value: string,
): string {
  return (
    value.match(/.{1,64}/g) ??
    []
  ).join("\n");
}

function rebuildPEM(
  rawValue: string,
  begin: string,
  end: string,
): string | null {
  const beginIndex =
    rawValue.indexOf(begin);

  const endIndex =
    rawValue.indexOf(end);

  if (
    beginIndex < 0 ||
    endIndex < 0 ||
    endIndex <= beginIndex
  ) {
    return null;
  }

  const bodyStart =
    beginIndex + begin.length;

  const body =
    rawValue
      .slice(
        bodyStart,
        endIndex,
      )
      /*
       * PEM gövdesindeki bütün whitespace'i
       * temizliyoruz.
       *
       * Böylece:
       *
       * ABCD EFGH
       * ABCD\nEFGH
       * ABCD
       * EFGH
       *
       * formatlarının tamamı toparlanır.
       */
      .replace(/\s+/g, "");

  if (!body) {
    return null;
  }

  /*
   * Base64 dışında karakter kaldıysa
   * PEM bozuk kabul edilir.
   */
  if (
    !/^[A-Za-z0-9+/=]+$/.test(
      body,
    )
  ) {
    return null;
  }

  return [
    begin,
    wrapBase64(body),
    end,
  ].join("\n");
}

function normalizePEM(
  value: string | undefined,
): string {
  if (!value) {
    return "";
  }

  let normalized =
    stripOuterQuotes(value);

  /*
   * .env.local formatında:
   *
   * -----BEGIN...\nABC...\n-----END...
   *
   * şeklinde gelirse gerçek newline'a çevir.
   */
  normalized =
    normalized.replace(
      /\\n/g,
      "\n",
    );

  normalized =
    normalized.replace(
      /\r\n/g,
      "\n",
    );

  normalized =
    normalized.replace(
      /\r/g,
      "\n",
    );

  normalized =
    normalized.trim();

  /*
   * PRIVATE KEY
   */
  for (
    const header
    of PRIVATE_HEADERS
  ) {
    if (
      normalized.includes(
        header.begin,
      )
    ) {
      return (
        rebuildPEM(
          normalized,
          header.begin,
          header.end,
        ) ??
        normalized
      );
    }
  }

  /*
   * PUBLIC KEY
   */
  if (
    normalized.includes(
      PUBLIC_HEADER.begin,
    )
  ) {
    return (
      rebuildPEM(
        normalized,
        PUBLIC_HEADER.begin,
        PUBLIC_HEADER.end,
      ) ??
      normalized
    );
  }

  return normalized;
}

// ======================================================
// PRIVATE KEY
// ======================================================

function loadPrivateKey(): KeyObject {
  const original =
    process.env[
      PRIVATE_KEY_ENV
    ];

  if (!original) {
    console.error(
      "[LICENSE PRIVATE KEY] Missing environment variable.",
    );

    throw new Error(
      "LICENSE_SIGNING_KEY_NOT_CONFIGURED",
    );
  }

  const pem =
    normalizePEM(original);

  const beginsPKCS8 =
    pem.startsWith(
      "-----BEGIN PRIVATE KEY-----",
    );

  const beginsEC =
    pem.startsWith(
      "-----BEGIN EC PRIVATE KEY-----",
    );

  console.log(
    "[LICENSE PRIVATE KEY DIAGNOSTIC]",
    {
      configured: true,

      originalLength:
        original.length,

      normalizedLength:
        pem.length,

      format:
        beginsPKCS8
          ? "PKCS8"
          : beginsEC
            ? "SEC1"
            : "UNKNOWN",

      lineCount:
        pem.split("\n").length,
    },
  );

  if (
    !beginsPKCS8 &&
    !beginsEC
  ) {
    throw new Error(
      "LICENSE_SIGNING_KEY_INVALID",
    );
  }

  let key: KeyObject;

  try {
    key =
      createPrivateKey({
        key: pem,
        format: "pem",
      });
  } catch (error) {
    console.error(
      "[LICENSE PRIVATE KEY PARSE FAILED]",
      error instanceof Error
        ? {
            name:
              error.name,

            message:
              error.message,
          }
        : "UNKNOWN",
    );

    throw new Error(
      "LICENSE_SIGNING_KEY_INVALID",
    );
  }

  if (
    key.asymmetricKeyType !==
    "ec"
  ) {
    console.error(
      "[LICENSE PRIVATE KEY] Not an EC key.",
      {
        type:
          key.asymmetricKeyType,
      },
    );

    throw new Error(
      "LICENSE_PRIVATE_KEY_NOT_EC",
    );
  }

  /*
   * ES256 = ECDSA + SHA-256 + P-256.
   */
  const curve =
    key.asymmetricKeyDetails
      ?.namedCurve;

  if (
    curve &&
    ![
      "prime256v1",
      "secp256r1",
      "P-256",
    ].includes(curve)
  ) {
    console.error(
      "[LICENSE PRIVATE KEY] Wrong EC curve.",
      {
        curve,
      },
    );

    throw new Error(
      "LICENSE_PRIVATE_KEY_WRONG_CURVE",
    );
  }

  return key;
}

// ======================================================
// PUBLIC KEY
// ======================================================

function loadPublicKey(): KeyObject {
  const configured =
    process.env[
      PUBLIC_KEY_ENV
    ];

  let key: KeyObject;

  if (configured) {
    const pem =
      normalizePEM(
        configured,
      );

    if (
      !pem.startsWith(
        PUBLIC_HEADER.begin,
      )
    ) {
      console.error(
        "[LICENSE PUBLIC KEY] Invalid PEM header.",
      );

      throw new Error(
        "LICENSE_PUBLIC_KEY_INVALID",
      );
    }

    try {
      key =
        createPublicKey({
          key: pem,
          format: "pem",
        });
    } catch (error) {
      console.error(
        "[LICENSE PUBLIC KEY PARSE FAILED]",
        error instanceof Error
          ? {
              name:
                error.name,

              message:
                error.message,
            }
          : "UNKNOWN",
      );

      throw new Error(
        "LICENSE_PUBLIC_KEY_INVALID",
      );
    }
  } else {
    /*
     * Public key ENV eksikse
     * private key'den türet.
     */
    try {
      key =
        createPublicKey(
          loadPrivateKey(),
        );
    } catch (error) {
      console.error(
        "[LICENSE PUBLIC KEY DERIVATION FAILED]",
        error,
      );

      throw new Error(
        "LICENSE_PUBLIC_KEY_INVALID",
      );
    }
  }

  if (
    key.asymmetricKeyType !==
    "ec"
  ) {
    throw new Error(
      "LICENSE_PUBLIC_KEY_NOT_EC",
    );
  }

  const curve =
    key.asymmetricKeyDetails
      ?.namedCurve;

  if (
    curve &&
    ![
      "prime256v1",
      "secp256r1",
      "P-256",
    ].includes(curve)
  ) {
    throw new Error(
      "LICENSE_PUBLIC_KEY_WRONG_CURVE",
    );
  }

  return key;
}

// ======================================================
// KEY PAIR VALIDATION
// ======================================================

function assertKeyPairMatches(): void {
  /*
   * Configured public key ile
   * private key'den türetilen public key
   * aynı mı?
   */

  const privateKey =
    loadPrivateKey();

  const derivedPublic =
    createPublicKey(
      privateKey,
    )
      .export({
        type: "spki",
        format: "der",
      });

  const configuredPublic =
    loadPublicKey()
      .export({
        type: "spki",
        format: "der",
      });

  if (
    !Buffer.from(
      derivedPublic,
    ).equals(
      Buffer.from(
        configuredPublic,
      ),
    )
  ) {
    console.error(
      "[LICENSE KEY PAIR] Private and public keys do not match.",
    );

    throw new Error(
      "LICENSE_KEY_PAIR_MISMATCH",
    );
  }
}

// ======================================================
// SIGN RECEIPT
// ======================================================

export function signReceipt(
  payload: SignedReceiptPayload,
): SignedReceipt {
  /*
   * Her receipt oluşturulurken public/private
   * key çiftinin eşleştiğinden emin oluyoruz.
   */
  assertKeyPairMatches();

  const canonical =
    canonicalReceipt(
      payload,
    );

  let signature: Buffer;

  try {
    signature =
      sign(
        "sha256",

        Buffer.from(
          canonical,
          "utf8",
        ),

        {
          key:
            loadPrivateKey(),

          /*
           * Swift tarafı 64-byte
           * IEEE-P1363 ECDSA imzası
           * doğrulayacak.
           */
          dsaEncoding:
            "ieee-p1363",
        },
      );
  } catch (error) {
    console.error(
      "[LICENSE RECEIPT SIGN FAILED]",
      error,
    );

    if (
      error instanceof Error &&
      error.message.startsWith(
        "LICENSE_",
      )
    ) {
      throw error;
    }

    throw new Error(
      "LICENSE_RECEIPT_SIGN_FAILED",
    );
  }

  return {
    payload,

    signature:
      signature.toString(
        "base64url",
      ),

    algorithm:
      "ES256",
  };
}

// ======================================================
// PUBLIC KEY PEM
// ======================================================

export function publicKeyPEM(): string {
  /*
   * Public key'i SPKI PEM formatında
   * standardize ederek gönder.
   */
  return loadPublicKey()
    .export({
      type: "spki",
      format: "pem",
    })
    .toString();
}

// ======================================================
// VERIFY RECEIPT
// ======================================================

export function verifyReceipt(
  receipt: SignedReceipt,
): boolean {
  if (
    receipt.algorithm !==
      "ES256" ||
    receipt.payload.version !==
      1 ||
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
        key:
          loadPublicKey(),

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
      "[LICENSE RECEIPT VERIFY FAILED]",
      error,
    );

    return false;
  }
}