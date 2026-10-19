"use client";

import { MotionConfig } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  // "user": framer skips transform animations when the OS asks for reduced motion.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
