import { NextRequest } from "next/server";

import { requireHafizContext } from "@/lib/hafiz/authorization";
import { noStoreJSON, hafizErrorResponse } from "@/lib/hafiz/http";
import { listQuranEditions } from "@/lib/hafiz/quran-repository";
import {
  listTeacherClasses,
  listTeacherStudents,
} from "@/lib/hafiz/relationships";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const context = await requireHafizContext(request, ["TEACHER"]);
    const [classes, students, editions] = await Promise.all([
      listTeacherClasses(context),
      listTeacherStudents(context),
      listQuranEditions(context),
    ]);

    return noStoreJSON({
      classes: classes.items,
      students: students.items,
      editions: editions.items,
    });
  } catch (error) {
    return hafizErrorResponse(error, "TEACHER ASSIGNMENT OPTIONS");
  }
}
