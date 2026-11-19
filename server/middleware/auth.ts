import type { Request, Response, NextFunction } from "express";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

function ensureFirebaseAdminInitialized() {
  if (getApps().length > 0) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    initializeApp({
      credential: cert(JSON.parse(serviceAccountJson)),
    });
    return;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.warn(
      "FIREBASE_PROJECT_ID (or FIREBASE_SERVICE_ACCOUNT_JSON) is not set. Firebase token verification will fail."
    );
  }

  initializeApp(projectId ? { projectId } : undefined);
}

ensureFirebaseAdminInitialized();

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const idToken = authHeader.slice("Bearer ".length).trim();
  if (!idToken) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    req.userId = decoded.uid;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error("Failed to verify Firebase ID token:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
