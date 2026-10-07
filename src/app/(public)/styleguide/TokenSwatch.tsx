"use client";

import { useEffect, useRef, useState } from "react";

/** A colour swatch that reads its live value from the CSS variable it shows. */
export default function TokenSwatch({ token, role, className }: { token: string; role: string; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setValue(getComputedStyle(el).getPropertyValue(`--${token}`).trim());
    read();
    // Re-read when the site theme changes (the class on <html> flips).
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [token]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      <div className={`h-11 w-11 flex-shrink-0 rounded-xl border border-border ${className}`} />
      <div className="min-w-0">
        <p className="font-mono text-sm font-medium text-text">{token}</p>
        <p className="truncate text-xs text-text-muted">
          {role}
          {value && <span className="font-mono"> · {value}</span>}
        </p>
      </div>
    </div>
  );
}
