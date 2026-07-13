/**
 * OBS Stream layout — completely bare.
 * No Navbar, no padding, black background.
 * Designed to be used as OBS/vMix Browser Source.
 *
 * This is a nested layout inside the root layout (which has <html>/<body>),
 * so we only render a wrapper <div> here — no duplicate <html>/<body>.
 */
export default function OBSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        background: "#000",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
