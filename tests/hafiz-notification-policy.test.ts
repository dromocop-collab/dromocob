import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  defaultNotificationPreferences,
  mayReceiveNotification,
  notificationDocumentID,
  parseNotificationPreferences,
  summaryLines,
  timezoneDayBounds,
  timezoneDateKey,
  timezoneHour,
} from "../lib/hafiz/notification-policy.ts";

test("notification idempotency key is stable and target scoped", () => {
  const input = { institutionID: "i", targetMembershipID: "s1", event: "NEW_ASSIGNMENT" as const,
    sourceID: "assignment-1" };
  assert.equal(notificationDocumentID(input), notificationDocumentID(input));
  assert.notEqual(notificationDocumentID(input), notificationDocumentID({ ...input, targetMembershipID: "s2" }));
});

test("role separation and preferences reject unrelated notification events", () => {
  const preferences = defaultNotificationPreferences("STUDENT");
  assert.equal(mayReceiveNotification("STUDENT", "NEW_ASSIGNMENT", preferences), true);
  assert.equal(mayReceiveNotification("STUDENT", "REVIEW_QUEUE_SUMMARY", preferences), false);
  const disabled = parseNotificationPreferences("STUDENT", { disabledEvents: ["NEW_ASSIGNMENT"] });
  assert.equal(mayReceiveNotification("STUDENT", "NEW_ASSIGNMENT", disabled), false);
});

test("timezone boundaries follow local midnight and daylight saving changes", () => {
  const istanbul = timezoneDayBounds(new Date("2026-09-27T12:00:00Z"), "Europe/Istanbul");
  assert.equal(istanbul.dateKey, "2026-09-27");
  assert.equal(istanbul.startAt, "2026-09-26T21:00:00.000Z");
  assert.equal(istanbul.endAtExclusive, "2026-09-27T21:00:00.000Z");
  const newYork = timezoneDayBounds(new Date("2026-03-08T16:00:00Z"), "America/New_York");
  assert.equal(newYork.startAt, "2026-03-08T05:00:00.000Z");
  assert.equal(newYork.endAtExclusive, "2026-03-09T04:00:00.000Z");
  assert.equal(timezoneDateKey(new Date("2026-09-26T22:30:00Z"), "Europe/Istanbul"), "2026-09-27");
  assert.equal(timezoneHour(new Date("2026-09-27T17:00:00Z"), "Europe/Istanbul"), 20);
});

test("summary omits activity durations that were not persisted", () => {
  const lines = summaryLines({ newAssignments: 1, repetitions: 8, listeningSeconds: 0,
    studySeconds: 2_280, submissions: 1, completedTasks: 5, totalTasks: 5, awaitingReview: 1 });
  assert.deepEqual(lines, ["1 yeni çalışma", "8 tekrar", "38 dk çalışma", "1 teslim",
    "5/5 görev", "1 çalışma öğretmen kontrolünde"]);
  assert.equal(lines.some(line => line.includes("dinleme")), false);
});

test("notification APIs are authenticated and scheduled runs require a secret", () => {
  const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  assert.match(source("app/api/hafiz/notifications/route.ts"), /requireHafizContext\(request\)/);
  assert.match(source("app/api/hafiz/teacher/messages/route.ts"), /\["TEACHER"\]/);
  assert.match(source("app/api/hafiz/internal/notifications/run/route.ts"), /HAFIZ_NOTIFICATION_CRON_SECRET/);
  const repository = source("lib/hafiz/notification-repository.ts");
  assert.match(repository, /if \(existing\.exists\) return/);
  assert.match(repository, /hafiz_progress_events/);
  assert.match(repository, /hafiz_audio_assets/);
  assert.doesNotMatch(repository, /Math\.random/);
});
