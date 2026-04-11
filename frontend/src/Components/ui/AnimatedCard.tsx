import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  glow?: boolean;
}

export function AnimatedCard({ children, className, delay = 0, glow = true, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative flex flex-col rounded-3xl border border-slate-200/50 bg-white/70 p-6 shadow-premium backdrop-blur-md transition-shadow hover:shadow-premium-hover dark:border-slate-800/50 dark:bg-slate-900/70",
        className
      )}
      {...props}
    >
      {glow && (
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-glass-gradient opacity-0 transition-opacity duration-300 hover:opacity-100 dark:hover:opacity-20" />
      )}
      {children}
    </motion.div>
  );
}
