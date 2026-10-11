"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { REVEAL_VIEWPORT } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait after entering view, for light staggering. */
  delay?: number;
  as?: "div" | "li";
}

/**
 * Fades and rises 8px once, as soon as it enters the viewport. Use it on
 * headings and cards, never on a whole section.
 *
 * The server (and a slow or disabled JS) renders it fully visible. After
 * hydration, only elements that are still below the fold get hidden, so
 * nothing already on screen flickers.
 */
export default function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, REVEAL_VIEWPORT);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    // Same line the observer uses: 8% above the bottom of the viewport.
    if (el.getBoundingClientRect().top > window.innerHeight * 0.92) setArmed(true);
  }, [reduceMotion]);

  const state = armed ? (inView ? "shown" : "hidden") : undefined;

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={state}
      style={delay && state ? ({ "--reveal-delay": `${Math.round(delay * 1000)}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
