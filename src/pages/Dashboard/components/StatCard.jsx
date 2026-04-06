import React from "react";
import { motion } from "framer-motion";

export const StatCard = ({
  title,
  icon: Icon,
  children,
  className = "",
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-gray-100/80 flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group ${className}`}
    >
      <div className="flex items-center gap-3 mb-5 text-sm font-bold text-gray-800 tracking-wide">
        {Icon && (
          <div className="p-2 rounded-lg bg-indigo-50/50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <span>{title}</span>
      </div>
      <div className="flex-1 flex flex-col relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
