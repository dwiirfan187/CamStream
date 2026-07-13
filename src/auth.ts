import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),

  // Wajib di production behind Railway proxy
  trustHost: true,

  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    // ── Email Magic Link (Nodemailer) ─────────────────────────────────────────
    Nodemailer({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
    }),
  ],

  pages: {
    // Arahkan ke halaman login custom kita
    signIn: "/login",
    // Error page bisa dibuat nanti
    error: "/login",
  },

  callbacks: {
    // Tambahkan user.id ke session agar bisa dipakai di Server Components
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
