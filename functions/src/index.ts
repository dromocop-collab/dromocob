import { initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

initializeApp();
const db = getFirestore();

export const expireLicenses = onSchedule({ schedule: "every day 02:15", timeZone: "Europe/Istanbul", region: "europe-west1" }, async () => {
  const now = Timestamp.now();
  const expired = await db.collection("licenses").where("status", "==", "active").where("expiresAt", "<=", now).limit(500).get();
  for (const license of expired.docs) {
    const activations = await db.collection("license_activations").where("licenseId", "==", license.id).where("active", "==", true).get();
    const batch = db.batch();
    batch.update(license.ref, { status: "expired", updatedAt: FieldValue.serverTimestamp() });
    activations.docs.forEach(item => batch.update(item.ref, { active: false, updatedAt: FieldValue.serverTimestamp() }));
    batch.set(db.collection("license_events").doc(), { type: "license_expired", licenseId: license.id, createdAt: FieldValue.serverTimestamp() });
    await batch.commit();
  }
});

export const pruneLicenseEvents = onSchedule({ schedule: "every sunday 03:30", timeZone: "Europe/Istanbul", region: "europe-west1" }, async () => {
  const cutoff = Timestamp.fromMillis(Date.now() - 400 * 86_400_000);
  const snapshot = await db.collection("license_events").where("createdAt", "<", cutoff).limit(500).get();
  const batch = db.batch(); snapshot.docs.forEach(doc => batch.delete(doc.ref)); await batch.commit();
});

export const queueLicenseMail = onDocumentCreated({ document: "licenses/{licenseId}", region: "europe-west1" }, async event => {
  const data = event.data?.data(); if (!data?.ownerEmail) return;
  await db.collection("mail").add({
    to: [data.ownerEmail],
    message: { subject: "Dromocob lisansınız hazır", html: `<h2>Dromocob Apps</h2><p>Lisansınız oluşturuldu. Güvenlik nedeniyle lisans anahtarı yalnızca yetkili gönderim ekranından paylaşılır.</p>` },
    metadata: { kind: "license-created", licenseId: event.params.licenseId },
    createdAt: FieldValue.serverTimestamp(),
  });
});
