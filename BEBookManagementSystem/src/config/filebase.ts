import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = require("../../bookmangement-ed3d3-firebase-adminsdk-fbsvc-5ea21a3707.json") as any;

initializeApp({
  credential: cert(serviceAccount),
});

export const auth = getAuth();