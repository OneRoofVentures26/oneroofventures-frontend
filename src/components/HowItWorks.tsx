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
 * Three steps. Mobile: a compact vertical timeline (number, title, one line)
 * joined by a line that draws itself as the section scrolls. From md: three
 * plain columns — number, title, description.
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

      <ol className="relative grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-10">
        {steps.map((step, idx) => (
          <Reveal
            as="li"
            key={step.title}
            delay={idx * 0.06}
            className="relative flex gap-3 md:flex-col md:gap-0 md:border-t md:border-text/15 md:pt-6"
          >
            <span className="num relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-surface text-sm font-bold text-primary-text md:h-auto md:w-auto md:justify-start md:border-0 md:bg-transparent md:font-display md:text-3xl md:text-accent-text">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-text md:mt-4 md:text-card">{step.title}</h3>
              <p className="text-sm text-text-muted md:hidden">{step.summary}</p>
              <p className="mt-2 hidden text-[15px] leading-relaxed text-text-muted md:block">{step.description}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
