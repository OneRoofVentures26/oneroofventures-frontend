"use client";

import { motion } from "framer-motion";
import { reveal } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait after entering view, for light staggering. */
  delay?: number;
  as?: "div" | "section" | "li";
}

/** Fades and rises once, the first time it scrolls into view. Never replays. */
export default function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
      custom={delay}
    >
      {children}
    </Component>
  );
}
