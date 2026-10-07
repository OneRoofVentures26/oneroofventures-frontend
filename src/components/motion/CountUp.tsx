"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * Counts from 0 to `value` once, when first scrolled into view. The server
 * renders the final number so it's correct without JS and for crawlers.
 */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    // Before it's been seen, hold at 0 so the count-up has somewhere to start.
    if (!inView) {
      el.textContent = "0";
      return;
    }
    const controls = animate(0, value, {
      duration: Math.min(1.6, 0.6 + value / 200),
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString("en-IN");
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-IN")}
    </span>
  );
}
