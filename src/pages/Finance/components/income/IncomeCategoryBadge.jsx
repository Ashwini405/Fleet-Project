import React from "react";
import { Truck, RefreshCw, UserCheck, Key, MoreHorizontal } from "lucide-react";

const CATEGORY_CONFIG = {
  "Freight": {
    icon: Truck,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  "Return Load": {
    icon: RefreshCw,
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
  "Client Payment": {
    icon: UserCheck,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  "Rental Income": {
    icon: Key,
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  "Miscellaneous": {
    icon: MoreHorizontal,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
};

const DEFAULT_CONFIG = {
  icon: MoreHorizontal,
  bg: "bg-gray-50",
  text: "text-gray-600",
  border: "border-gray-200",
  dot: "bg-gray-400",
};

export default function IncomeCategoryBadge({ category, size = "md" }) {
  const cfg = CATEGORY_CONFIG[category] || DEFAULT_CONFIG;
  const Icon = cfg.icon;

  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-[10px] gap-1"
    : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <Icon className={size === "sm" ? "w-2.5 h-2.5 shrink-0" : "w-3 h-3 shrink-0"} />
      {category}
    </span>
  );
}

export { CATEGORY_CONFIG };
