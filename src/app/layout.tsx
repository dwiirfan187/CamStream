import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CamCast — Wireless Camera Mirroring",
  description:
    "Jadikan smartphone kamu sebagai wireless external camera untuk OBS/vMix dengan latensi ultra-rendah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F9FA]">
        <Navbar />
        <main className="flex flex-col flex-1">{children}</main>
      </body>
    </html>
  );
}
