"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Reveal from "@/components/motion/Reveal";

interface Step {
  title: string;
  description: string;
}

/**
 * Three steps joined by a line that draws itself as the section scrolls
 * through the viewport: horizontal on desktop, vertical on mobile. The line is
 * a scaled bar, so only transform animates.
 */
export default function HowItWorks({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const scale = reduceMotion ? 1 : progress;

  return (
    <div ref={ref} className="relative mt-12">
      {/* Track + drawn line: vertical on mobile (through the markers), horizontal from md. */}
      <div aria-hidden="true" className="absolute bottom-6 left-5 top-5 w-px bg-border md:hidden">
        <motion.div className="h-full w-full origin-top bg-gradient-brand" style={{ scaleY: scale }} />
      </div>
      <div aria-hidden="true" className="absolute left-[16.66%] right-[16.66%] top-5 hidden h-px bg-border md:block">
        <motion.div className="h-full w-full origin-left bg-gradient-brand" style={{ scaleX: scale }} />
      </div>

      <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
        {steps.map((step, idx) => (
          <Reveal as="li" key={step.title} delay={idx * 0.08} className="relative pl-16 md:pl-0 md:text-center">
            <span className="num absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-base font-bold text-primary-text shadow-card md:relative md:mx-auto">
              {idx + 1}
            </span>
            <h3 className="text-card font-semibold text-text md:mt-6">{step.title}</h3>
            <p className="mt-2 text-base text-text-muted md:mx-auto md:max-w-xs">{step.description}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
