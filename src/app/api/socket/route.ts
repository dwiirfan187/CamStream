/**
 * /api/socket — Socket.io upgrade endpoint.
 *
 * The actual Socket.io server lives in server.ts (custom HTTP server).
 * This route exists only so Next.js doesn't 404 the /api/socket path
 * when the custom server isn't running (e.g. during `next build`).
 */
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, message: "Socket.io is handled by the custom server." });
}
