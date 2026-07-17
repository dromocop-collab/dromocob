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

const EMPTY_METRICS = {
  projects: 0,
  quotes: 0,
  chats: 0,
  sites: 0,
};

function isExpectedAdminDataError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  return (
    message.includes("Could not load the default credentials") ||
    message.includes("Unable to detect a Project Id") ||
    message.includes("permission") ||
    message.includes("PERMISSION_DENIED") ||
    message.includes("Missing or insufficient permissions")
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    await requireAdminToken(
      request.headers.get("authorization")
    );

    let metrics = EMPTY_METRICS;

    try {
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

      metrics = {
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
      };
    } catch (metricsError) {
      if (!isExpectedAdminDataError(metricsError)) {
        throw metricsError;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        metrics,
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
