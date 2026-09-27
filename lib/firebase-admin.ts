import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getAuth,
} from "firebase-admin/auth";

import {
  getFirestore,
} from "firebase-admin/firestore";

import { getStorage } from "firebase-admin/storage";

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "dromocob";

const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const storageBucket = process.env.FIREBASE_ADMIN_STORAGE_BUCKET
  || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const credential =
  projectId && clientEmail && privateKey
    ? cert({
        projectId,
        clientEmail,
        privateKey,
      })
    : applicationDefault();

export const adminApp =
  getApps().length > 0
    ? getApps()[0]
      : initializeApp({
        credential,
        projectId,
        storageBucket,
      });

export const adminAuth =
  getAuth(adminApp);

export const adminDb =
  getFirestore(adminApp);

export const adminStorage =
  getStorage(adminApp);
