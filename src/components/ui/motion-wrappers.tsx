"use client";

import { motion, HTMLMotionProps, AnimatePresence } from "motion/react";
import React from "react";
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM, FADE_IN_SCALE } from "@/lib/animations";

type Props = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function FadeIn({ children, className, delay = 0, ...props }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={FADE_IN}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInScale({ children, className, delay = 0, ...props }: Props) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={FADE_IN_SCALE}
        transition={{ delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
}

export function StaggerList({ children, className, ...props }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={STAGGER_CONTAINER}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...props }: Props) {
  return (
    <motion.div
      variants={STAGGER_ITEM}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
