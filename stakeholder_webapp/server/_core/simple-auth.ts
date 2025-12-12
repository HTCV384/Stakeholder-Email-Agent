/**
 * Simple JWT Authentication for Render Deployment
 * This replaces Manus OAuth with a basic email/password system
 * Can be enhanced later with Auth0 or other providers
 */

import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

// Simple user for demo purposes - in production you'd have proper registration
const DEMO_USER = {
  email: "demo@stakeholder.app",
  password: "demo123", // In production: hash this with bcrypt
  name: "Demo User",
  openId: "demo-user-001"
};

export class SimpleAuth {
  private getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET || "fallback-dev-secret-change-in-production";
    return new TextEncoder().encode(secret);
  }

  async createSessionToken(user: { email: string; name: string; openId: string }): Promise<string> {
    const secretKey = this.getJwtSecret();
    const issuedAt = Math.floor(Date.now() / 1000);
    const expirationTime = issuedAt + (7 * 24 * 60 * 60); // 7 days

    return new SignJWT({
      email: user.email,
      name: user.name,
      openId: user.openId,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(issuedAt)
      .setExpirationTime(expirationTime)
      .sign(secretKey);
  }

  async verifySessionToken(token: string): Promise<{ email: string; name: string; openId: string } | null> {
    try {
      const secretKey = this.getJwtSecret();
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      return {
        email: payload.email as string,
        name: payload.name as string,
        openId: payload.openId as string,
      };
    } catch (error) {
      console.warn("[SimpleAuth] Token verification failed:", error);
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    // Check for session cookie
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    
    if (!sessionCookie) {
      throw ForbiddenError("No session cookie found");
    }

    const session = await this.verifySessionToken(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session token");
    }

    // Get or create user in database
    let user = await db.getUserByOpenId(session.openId);
    
    if (!user) {
      // Auto-create user on first login
      await db.upsertUser({
        openId: session.openId,
        name: session.name,
        email: session.email,
        loginMethod: "simple",
        lastSignedIn: new Date(),
      });
      user = await db.getUserByOpenId(session.openId);
    }

    if (!user) {
      throw ForbiddenError("Failed to create/retrieve user");
    }

    // Update last signed in
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: new Date(),
    });

    return user;
  }

  async loginWithCredentials(email: string, password: string): Promise<string | null> {
    // Simple demo authentication - replace with proper password hashing in production
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      return this.createSessionToken({
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        openId: DEMO_USER.openId,
      });
    }
    
    return null;
  }

  private parseCookies(cookieHeader: string | undefined): Map<string, string> {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
}

export const simpleAuth = new SimpleAuth();
