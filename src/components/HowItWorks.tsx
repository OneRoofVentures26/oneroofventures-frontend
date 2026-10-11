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

/**
 * Three steps joined by a line that draws itself as the section scrolls
 * through the viewport. Mobile: a compact vertical timeline (number, title,
 * one line). From md: three left-aligned columns with a horizontal line through
 * the markers. The line is a scaled bar, so only transform animates.
 */
export default function HowItWorks({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const scale = reduceMotion ? 1 : progress;

  return (
    <div ref={ref} className="relative">
      {/* Vertical on mobile (through the 32px markers), horizontal from md (first to last marker). */}
      <div aria-hidden="true" className="absolute bottom-4 left-4 top-4 w-px bg-border md:hidden">
        <motion.div className="h-full w-full origin-top bg-gradient-brand" style={{ scaleY: scale }} />
      </div>
      <div
        aria-hidden="true"
        className="absolute left-5 right-[calc((100%-4rem)/3-1.25rem)] top-5 hidden h-px bg-border md:block"
      >
        <motion.div className="h-full w-full origin-left bg-gradient-brand" style={{ scaleX: scale }} />
      </div>

      <ol className="relative grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
        {steps.map((step, idx) => (
          <Reveal as="li" key={step.title} delay={idx * 0.06} className="relative flex gap-3 md:block">
            <span className="num relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-sm font-bold text-primary-text shadow-card md:h-10 md:w-10 md:rounded-xl md:text-base">
              {idx + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-text md:mt-5 md:text-card">{step.title}</h3>
              <p className="text-sm text-text-muted md:hidden">{step.summary}</p>
              <p className="mt-2 hidden text-base text-text-muted md:block">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
