// --- apps/functions/src/firebaseAdmin.ts ---
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
// This will automatically use the correct credentials when deployed.
admin.initializeApp({
  databaseURL: "https://property-pasalo-main-default-rtdb.firebaseio.com",
  storageBucket: "property-pasalo-main.firebasestorage.app",
});

export default admin;
