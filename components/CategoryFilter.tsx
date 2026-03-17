"use client";

import { motion } from "framer-motion";
import { ZenMessage } from "@/lib/types";

type Category = ZenMessage["category"] | "all";

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
  counts: Record<Category, number>;
}

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "wisdom", label: "Wisdom" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "dharma", label: "Dharma" },
  { value: "practice", label: "Practice" },
];

export default function CategoryFilter({
  selected,
  onSelect,
  counts,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map(({ value, label }) => {
        const isActive = selected === value;
        const count = counts[value] ?? 0;

        return (
          <motion.button
            key={value}
            onClick={() => onSelect(value)}
            whileTap={{ scale: 0.95 }}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B9A7D] focus-visible:ring-offset-2 ${
              isActive
                ? "bg-[#8B9A7D] text-white border-[#8B9A7D] shadow-sm"
                : "bg-transparent text-[#6B7A6C] border-[#8B9A7D]/40 hover:border-[#8B9A7D] hover:text-[#4a5e3a]"
            }`}
          >
            <span>{label}</span>
            <span
              className={`ml-1.5 inline-flex items-center justify-center text-xs rounded-full w-5 h-5 ${
                isActive
                  ? "bg-white/25 text-white"
                  : "bg-[#8B9A7D]/15 text-[#6B7A6C]"
              }`}
            >
              {count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
