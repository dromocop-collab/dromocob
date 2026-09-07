import { timingSafeEqual } from "node:crypto";

import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import {
  adminDb,
} from "@/lib/firebase-admin";

import {
  requireAdminRole,
} from "@/lib/admin-guard";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


const COLLECTION =
  "ultra_requests";

const VALID_STATUSES =
  new Set([
    "new",
    "reviewing",
    "planned",
    "done",
    "rejected",
  ]);


function text(
  value: unknown,
  max = 1000,
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


function serialize(
  doc:
    FirebaseFirestore
      .QueryDocumentSnapshot,
) {
  const data =
    doc.data();

  return {
    id:
      doc.id,

    ...Object.fromEntries(
      Object.entries(
        data,
      ).map(
        (
          [
            key,
            value,
          ],
        ) => [
          key,

          value instanceof
            Timestamp
            ? value
                .toDate()
                .toISOString()
            : value,
        ],
      ),
    ),
  };
}


const RELEASE_CENTER_TOKEN_HEADER =
  "x-dromocob-ultra-token";

const RELEASE_CENTER_TOKEN_ENV =
  "DROMOCOB_ULTRA_REQUEST_ADMIN_TOKEN";


function secureTokenEqual(
  supplied: string,
  expected: string,
) {

  const suppliedBuffer =
    Buffer.from(
      supplied,
      "utf8",
    );

  const expectedBuffer =
    Buffer.from(
      expected,
      "utf8",
    );


  if (
    suppliedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }


  return timingSafeEqual(
    suppliedBuffer,
    expectedBuffer,
  );
}


function authorizeReleaseCenter(
  request: Request,
) {

  const expected =
    (
      process.env[
        RELEASE_CENTER_TOKEN_ENV
      ] ||
      ""
    ).trim();

  const supplied =
    (
      request.headers.get(
        RELEASE_CENTER_TOKEN_HEADER,
      ) ||
      ""
    ).trim();


  if (
    !expected ||
    !supplied
  ) {
    return false;
  }


  return secureTokenEqual(
    supplied,
    expected,
  );
}


const RELEASE_CENTER_TOKEN_HEADER =
  "x-dromocob-ultra-token";

const RELEASE_CENTER_TOKEN_ENV =
  "DROMOCOB_ULTRA_REQUEST_ADMIN_TOKEN";


function secureTokenEqual(
  supplied: string,
  expected: string,
) {

  const suppliedBuffer =
    Buffer.from(
      supplied,
      "utf8",
    );

  const expectedBuffer =
    Buffer.from(
      expected,
      "utf8",
    );


  if (
    suppliedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }


  return timingSafeEqual(
    suppliedBuffer,
    expectedBuffer,
  );
}


function authorizeReleaseCenter(
  request: Request,
) {

  const expected =
    (
      process.env[
        RELEASE_CENTER_TOKEN_ENV
      ] ||
      ""
    ).trim();

  const supplied =
    (
      request.headers.get(
        RELEASE_CENTER_TOKEN_HEADER,
      ) ||
      ""
    ).trim();


  if (
    !expected ||
    !supplied
  ) {
    return false;
  }


  return secureTokenEqual(
    supplied,
    expected,
  );
}


async function authorize(
  request: Request,
) {

  /*
   * Native macOS Release Center.
   *
   * Secret yalnızca:
   * - Firebase Secret Manager
   * - macOS Keychain
   *
   * içinde tutulur.
   */
  if (
    authorizeReleaseCenter(
      request,
    )
  ) {
    return;
  }


  /*
   * Mevcut web admin Firebase Auth
   * davranışı aynen korunuyor.
   */
  await requireAdminRole(
    request.headers.get(
      "authorization",
    ),
    [
      "super_admin",
      "admin",
      "license_manager",
      "support",
    ],
  );
}


function errorResponse(
  error: unknown,
) {
  const code =
    error instanceof Error
      ? error.message
      : "UNKNOWN";

  return Response.json(
    {
      ok: false,
      error:
        code,
    },
    {
      status:
        code ===
        "UNAUTHORIZED"
          ? 401
          : code ===
              "FORBIDDEN"
            ? 403
            : 500,

      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}


export async function GET(
  request: Request,
) {
  try {

    await authorize(
      request,
    );


    const url =
      new URL(
        request.url,
      );

    const status =
      text(
        url.searchParams.get(
          "status",
        ),
        30,
      );

    const requestedLimit =
      Number(
        url.searchParams.get(
          "limit",
        ) ||
        200,
      );

    const limit =
      Math.max(
        1,
        Math.min(
          500,
          Number.isFinite(
            requestedLimit,
          )
            ? Math.round(
                requestedLimit,
              )
            : 200,
        ),
      );


    let query:
      FirebaseFirestore.Query =
        adminDb
          .collection(
            COLLECTION,
          );


    if (
      status &&
      VALID_STATUSES.has(
        status,
      )
    ) {
      query =
        query.where(
          "status",
          "==",
          status,
        );
    }


    const snapshot =
      await query
        .orderBy(
          "createdAt",
          "desc",
        )
        .limit(
          limit,
        )
        .get();


    return Response.json(
      {
        ok: true,

        count:
          snapshot.size,

        requests:
          snapshot.docs.map(
            serialize,
          ),
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );

  } catch (
    error
  ) {
    return errorResponse(
      error,
    );
  }
}


export async function PATCH(
  request: Request,
) {
  try {

    await authorize(
      request,
    );


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
      return Response.json(
        {
          ok: false,
          error:
            "INVALID_BODY",
        },
        {
          status: 400,
        },
      );
    }


    const id =
      text(
        body.id,
        180,
      );

    const status =
      text(
        body.status,
        30,
      );

    const adminNotes =
      text(
        body.adminNotes,
        5000,
      );


    if (
      !id
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "REQUEST_ID_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }


    if (
      status &&
      !VALID_STATUSES.has(
        status,
      )
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "INVALID_STATUS",
        },
        {
          status: 400,
        },
      );
    }


    const ref =
      adminDb
        .collection(
          COLLECTION,
        )
        .doc(
          id,
        );

    const existing =
      await ref.get();


    if (
      !existing.exists
    ) {
      return Response.json(
        {
          ok: false,
          error:
            "REQUEST_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }


    const update:
      Record<
        string,
        unknown
      > = {
        updatedAt:
          FieldValue
            .serverTimestamp(),
    };


    if (
      status
    ) {
      update.status =
        status;
    }


    if (
      Object.prototype
        .hasOwnProperty.call(
          body,
          "adminNotes",
        )
    ) {
      update.adminNotes =
        adminNotes;
    }


    await ref.update(
      update,
    );


    const updated =
      await ref.get();


    return Response.json(
      {
        ok: true,

        request:
          updated.exists
            ? serialize(
                updated as FirebaseFirestore.QueryDocumentSnapshot,
              )
            : null,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );

  } catch (
    error
  ) {
    return errorResponse(
      error,
    );
  }
}
