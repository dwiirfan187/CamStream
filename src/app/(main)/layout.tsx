import Navbar from "@/components/Navbar";

/**
 * (main) route group layout — renders the Navbar and standard app chrome.
 * Pages under /dashboard, /login, /transmitter, /receiver, and / all use this.
 * The /stream/* routes sit OUTSIDE this group and get NO Navbar.
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex flex-col flex-1">{children}</main>
    </>
  );
}
