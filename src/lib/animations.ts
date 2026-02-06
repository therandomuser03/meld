
import { Variants } from "motion/react";

export const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const FADE_IN: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: EASING } 
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { duration: 0.2, ease: "easeIn" } 
  }
};

export const FADE_IN_SCALE: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: EASING } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 } 
  }
};

export const SLIDE_IN_RIGHT: Variants = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 } 
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { duration: 0.2 } 
  }
};

export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: EASING }
  },
  exit: { opacity: 0, y: -10 }
};

export const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 400,
  damping: 30
};
