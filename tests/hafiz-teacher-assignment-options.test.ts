import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(
  new URL(
    "../app/api/hafiz/teacher/assignment-options/route.ts",
    import.meta.url,
  ),
  "utf8",
);

test("teacher assignment options include authorized Quran catalogue data", () => {
  assert.match(route, /requireHafizContext\(request, \["TEACHER"\]\)/);
  assert.match(route, /listTeacherClasses\(context\)/);
  assert.match(route, /listTeacherStudents\(context\)/);
  assert.match(route, /listQuranEditions\(context\)/);
  assert.match(route, /Promise\.all/);
});

test("student and parent roles cannot open teacher assignment options", () => {
  assert.doesNotMatch(route, /\["TEACHER", "STUDENT"\]/);
  assert.doesNotMatch(route, /\["TEACHER", "PARENT"\]/);
  assert.doesNotMatch(route, /HAFIZ_ROLES/);
});
