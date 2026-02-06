
import { useReducedMotion as useFramerReducedMotion } from "motion/react";

/**
 * Custom hook to check if the user prefers reduced motion.
 * Wraps framer-motion's useReducedMotion for consistency and potential future overrides.
 */
export function useReducedMotion() {
  return useFramerReducedMotion();
}
