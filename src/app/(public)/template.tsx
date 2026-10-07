// Remounts on every route change, so each new page gets a short fade-in.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
