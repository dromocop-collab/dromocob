import {
  createHash,
  randomBytes,
} from "node:crypto";

import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import {
  adminDb,
} from "@/lib/firebase-admin";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


const COLLECTION =
  "ultra_requests";

const RATE_LIMIT_COLLECTION =
  "ultra_request_rate_limits";

const PRODUCT_ID =
  "dromocob-ultra-ae";


function text(
  value: unknown,
  max = 500,
) {
  return String(
    value ?? "",
  )
    .trim()
    .slice(
      0,
      max,
    );
}


function hash(
  value: string,
) {
  return createHash(
    "sha256",
  )
    .update(
      value,
      "utf8",
    )
    .digest(
      "hex",
    );
}


function requestFingerprint(
  request: Request,
  deviceHash: string,
) {
  const forwarded =
    request.headers
      .get(
        "x-forwarded-for",
      )
      ?.split(
        ",",
      )[0]
      ?.trim() || "";

  const realIp =
    request.headers.get(
      "x-real-ip",
    ) || "";

  const userAgent =
    request.headers.get(
      "user-agent",
    ) || "";

  return hash(
    [
      forwarded,
      realIp,
      userAgent,
      deviceHash,
      PRODUCT_ID,
    ].join(
      "|",
    ),
  );
}


function requestCode() {
  const now =
    new Date();

  const yyyy =
    String(
      now.getUTCFullYear(),
    );

  const mm =
    String(
      now.getUTCMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const dd =
    String(
      now.getUTCDate(),
    ).padStart(
      2,
      "0",
    );

  const random =
    randomBytes(
      4,
    )
      .toString(
        "hex",
      )
      .toUpperCase();

  return (
    "DROM-REQ-" +
    yyyy +
    mm +
    dd +
    "-" +
    random
  );
}


function numberValue(
  value: unknown,
) {
  const result =
    Number(
      value,
    );

  return Number.isFinite(
    result,
  )
    ? result
    : null;
}


function diagnostics(
  value: unknown,
) {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return {};
  }

  const input =
    value as Record<
      string,
      unknown
    >;

  return {
    appVersion:
      text(
        input.appVersion,
        50,
      ),

    extensionVersion:
      text(
        input.extensionVersion,
        50,
      ),

    aeVersion:
      text(
        input.aeVersion,
        80,
      ),

    platform:
      text(
        input.platform,
        100,
      ),

    osVersion:
      text(
        input.osVersion,
        150,
      ),

    renderer:
      text(
        input.renderer,
        120,
      ),

    compName:
      text(
        input.compName,
        180,
      ),

    width:
      numberValue(
        input.width,
      ),

    height:
      numberValue(
        input.height,
      ),

    fps:
      numberValue(
        input.fps,
      ),

    selectedLayers:
      numberValue(
        input.selectedLayers,
      ),

    deviceHash:
      text(
        input.deviceHash,
        180,
      ),
  };
}


function corsHeaders() {
  return {
    "Access-Control-Allow-Origin":
      "*",

    "Access-Control-Allow-Methods":
      "POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type, Authorization",

    "Cache-Control":
      "no-store",
  };
}


function json(
  body: unknown,
  status = 200,
) {
  return Response.json(
    body,
    {
      status,
      headers:
        corsHeaders(),
    },
  );
}


export async function OPTIONS() {
  return new Response(
    null,
    {
      status: 204,
      headers:
        corsHeaders(),
    },
  );
}


export async function POST(
  request: Request,
) {
  try {

    const body =
      await request
        .json()
        .catch(
          () => null,
        ) as
        | Record<
            string,
            unknown
          >
        | null;


    if (
      !body
    ) {
      return json(
        {
          ok: false,
          error:
            "Geçersiz istek.",
        },
        400,
      );
    }


    /*
     * Honeypot.
     *
     * Gerçek Ultra paneli bunu doldurmaz.
     */
    if (
      text(
        body.website,
        200,
      )
    ) {
      return json(
        {
          ok: true,
        },
      );
    }


    const type =
      text(
        body.type,
        80,
      ) ||
      "general";

    const title =
      text(
        body.title,
        180,
      );

    const description =
      text(
        body.description,
        5000,
      );

    const priority =
      text(
        body.priority,
        40,
      ) ||
      "normal";

    const module =
      text(
        body.module,
        100,
      ) ||
      "general";

    const source =
      text(
        body.source,
        100,
      ) ||
      PRODUCT_ID;

    const localRequestId =
      text(
        body.localRequestId,
        120,
      );

    const deviceHash =
      text(
        body.deviceHash,
        180,
      );

    const diagnosticData =
      diagnostics(
        body.diagnostics,
      );


    if (
      title.length <
        2
    ) {
      return json(
        {
          ok: false,
          error:
            "Başlık en az 2 karakter olmalıdır.",
        },
        400,
      );
    }


    if (
      description.length <
        3
    ) {
      return json(
        {
          ok: false,
          error:
            "Açıklama en az 3 karakter olmalıdır.",
        },
        400,
      );
    }


    const fingerprint =
      requestFingerprint(
        request,
        deviceHash,
      );

    const limiterRef =
      adminDb
        .collection(
          RATE_LIMIT_COLLECTION,
        )
        .doc(
          fingerprint,
        );

    const requestRef =
      adminDb
        .collection(
          COLLECTION,
        )
        .doc();

    const requestId =
      requestCode();


    await adminDb.runTransaction(
      async (
        transaction,
      ) => {

        const limiter =
          await transaction.get(
            limiterRef,
          );

        const previous =
          limiter
            .data()
            ?.lastSubmittedAt as
            | Timestamp
            | undefined;


        if (
          previous
        ) {
          const elapsed =
            Date.now() -
            previous
              .toMillis();

          /*
           * Yanlışlıkla çift tıklamayı ve spam'i önle.
           */
          if (
            elapsed <
            20_000
          ) {
            throw new Error(
              "RATE_LIMIT",
            );
          }
        }


        transaction.set(
          limiterRef,
          {
            lastSubmittedAt:
              Timestamp.now(),

            updatedAt:
              FieldValue
                .serverTimestamp(),
          },
          {
            merge: true,
          },
        );


        transaction.set(
          requestRef,
          {
            requestId,

            localRequestId,

            productId:
              PRODUCT_ID,

            source,

            type,

            title,

            description,

            priority,

            module,

            diagnostics:
              diagnosticData,

            deviceHash,

            fingerprint,

            status:
              "new",

            adminNotes:
              "",

            createdAt:
              FieldValue
                .serverTimestamp(),

            updatedAt:
              FieldValue
                .serverTimestamp(),
          },
        );
      },
    );


    return json(
      {
        ok: true,

        id:
          requestRef.id,

        requestId,

        status:
          "new",

        message:
          "Talebin Dromocob İstek Merkezi'ne ulaştı.",
      },
      201,
    );

  } catch (
    error
  ) {

    if (
      error instanceof
        Error &&
      error.message ===
        "RATE_LIMIT"
    ) {
      return json(
        {
          ok: false,

          error:
            "Talep az önce gönderildi. Birkaç saniye sonra tekrar deneyebilirsin.",
        },
        429,
      );
    }


    console.error(
      "[ULTRA REQUEST CREATE ERROR]",
      error,
    );


    return json(
      {
        ok: false,

        error:
          "Talep şu anda kaydedilemedi.",
      },
      500,
    );
  }
}
