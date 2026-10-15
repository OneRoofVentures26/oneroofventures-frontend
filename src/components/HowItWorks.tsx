"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Reveal from "@/components/motion/Reveal";

interface Step {
  title: string;
  /** One line, shown in the compact mobile timeline. */
  summary: string;
  description: string;
}

const ICONS = [
  // Tap / answer
  <path key="tap" d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a5 5 0 0 1-5 5h-1.2a5 5 0 0 1-3.9-1.9L4.6 15.2a1.5 1.5 0 0 1 2.3-1.9L9 15.5" />,
  // Sparkle / picks
  <path key="spark" d="M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.8L12 3.5zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />,
  // Paper plane / send
  <path key="send" d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5 21 3z" />,
];

/**
 * Three steps. Mobile: a compact vertical timeline (number, title, one line)
 * joined by a line that draws itself as the section scrolls. From md: three
 * equal cards, each with a number, an icon and the full description, joined by
 * small connectors in the gaps.
 */
export default function HowItWorks({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const scale = reduceMotion ? 1 : progress;

  return (
    <div ref={ref} className="relative">
      {/* Vertical line through the 32px markers, mobile only. */}
      <div aria-hidden="true" className="absolute bottom-4 left-4 top-4 w-px bg-border md:hidden">
        <motion.div className="h-full w-full origin-top bg-gradient-brand" style={{ scaleY: scale }} />
      </div>

      <ol className="relative grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {steps.map((step, idx) => (
          <Reveal
            as="li"
            key={step.title}
            delay={idx * 0.06}
            className="relative flex gap-3 md:flex-col md:gap-0 md:rounded-2xl md:border md:border-border md:bg-surface md:p-6 md:shadow-card"
          >
            {/* Connector to the next card, in the gap. */}
            {idx < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute -right-7 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-band text-primary-text md:flex"
              >
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10h12M11 5l5 5-5 5" />
                </svg>
              </span>
            )}

            <div className="flex items-start justify-between md:items-center">
              <span className="num relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-sm font-bold text-primary-text shadow-card md:h-10 md:w-10 md:rounded-xl md:border-primary/20 md:bg-primary/10 md:text-base md:shadow-none">
                {idx + 1}
              </span>
              <span className="hidden h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-[0_8px_20px_-8px_rgb(91_91_240/0.6)] md:flex">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[idx % ICONS.length]}
                </svg>
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-text md:mt-6 md:text-card">{step.title}</h3>
              <p className="text-sm text-text-muted md:hidden">{step.summary}</p>
              <p className="mt-2 hidden text-[15px] leading-relaxed text-text-muted md:block">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
