import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminDb,
} from "@/lib/firebase-admin";

import {
  requireAdminToken,
} from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest
) {
  try {
    await requireAdminToken(
      request.headers.get("authorization")
    );

    const [
      projectsSnapshot,
      quotesSnapshot,
      chatsSnapshot,
      sitesSnapshot,
    ] = await Promise.all([
      adminDb
        .collection("projects")
        .count()
        .get(),

      adminDb
        .collection("quotes")
        .where(
          "status",
          "==",
          "new"
        )
        .count()
        .get(),

      adminDb
        .collection("chat_sessions")
        .where(
          "status",
          "==",
          "open"
        )
        .count()
        .get(),

      adminDb
        .collection("managed_sites")
        .count()
        .get(),
    ]);

    return NextResponse.json(
      {
        ok: true,

        metrics: {
          projects:
            projectsSnapshot
              .data()
              .count,

          quotes:
            quotesSnapshot
              .data()
              .count,

          chats:
            chatsSnapshot
              .data()
              .count,

          sites:
            sitesSnapshot
              .data()
              .count,
        },
      },
      {
        headers: {
          "cache-control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "UNKNOWN";

    if (
      message === "UNAUTHORIZED"
    ) {
      return new NextResponse(
        "Unauthorized",
        {
          status: 401,
        }
      );
    }

    if (
      message === "FORBIDDEN"
    ) {
      return new NextResponse(
        "Forbidden",
        {
          status: 403,
        }
      );
    }

    console.error(
      "[ADMIN METRICS]",
      error
    );

    return new NextResponse(
      "Dashboard metrics failed",
      {
        status: 500,
      }
    );
  }
}