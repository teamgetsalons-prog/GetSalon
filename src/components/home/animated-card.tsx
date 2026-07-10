"use client";

import { motion } from "framer-motion";

export function AnimatedCard({
  children,
  index = 0,
}: {
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
