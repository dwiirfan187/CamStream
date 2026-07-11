/**
 * OBS Stream layout — completely bare.
 * No Navbar, no padding, transparent/black background.
 * Designed to be used as OBS Browser Source.
 */
export default function OBSLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; background: transparent; overflow: hidden; }
        `}</style>
      </head>
      <body style={{ width: "100%", height: "100%", background: "transparent" }}>
        {children}
      </body>
    </html>
  );
}
