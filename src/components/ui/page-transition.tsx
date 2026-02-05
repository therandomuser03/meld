"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageTransitionProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
}

export function PageTransition({ children, className, ...props }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={cn("w-full", className)}
            {...props}
        >
            {children}
        </motion.div>
    )
}
