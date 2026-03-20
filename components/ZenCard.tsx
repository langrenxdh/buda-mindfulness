"use client";

import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { ZenMessage } from "@/lib/types";

interface ZenCardProps {
  message: ZenMessage;
  index: number;
  locale: string;
}

const categoryStyles: Record<
  ZenMessage["category"],
  { badge: string; bg: string; border: string }
> = {
  wisdom: {
    badge: "bg-[#8B9A7D]/20 text-[#4a5e3a] border border-[#8B9A7D]/30",
    bg: "bg-gradient-to-br from-white to-[#f0f4ed]",
    border: "border-[#8B9A7D]/20",
  },
  mindfulness: {
    badge: "bg-sky-100 text-sky-700 border border-sky-200",
    bg: "bg-gradient-to-br from-white to-[#edf6f9]",
    border: "border-sky-100",
  },
  dharma: {
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    bg: "bg-gradient-to-br from-white to-[#fdf8ee]",
    border: "border-amber-100",
  },
  practice: {
    badge: "bg-rose-100 text-rose-700 border border-rose-200",
    bg: "bg-gradient-to-br from-white to-[#fdf0f0]",
    border: "border-rose-100",
  },
};

function formatDate(isoString: string, locale: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export default function ZenCard({ message, index, locale }: ZenCardProps) {
  const t = useTranslations("categories");
  const styles = categoryStyles[message.category];

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border ${styles.bg} ${styles.border} flex flex-col gap-4`}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles.badge}`}
        >
          {t(message.category)}
        </span>
        <span className="text-xs text-[#6B7A6C]">
          {formatDate(message.timestamp, locale)}
        </span>
      </div>

      {/* Quote */}
      <blockquote
        className="text-lg leading-relaxed text-[#2D3A2E] italic"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        &ldquo;{message.content}&rdquo;
      </blockquote>

      {/* Source */}
      {message.source && (
        <p className="text-sm text-[#6B7A6C] font-medium">
          &mdash; {message.source}
        </p>
      )}

      {/* Tags */}
      {message.tags && message.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {message.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#6B7A6C] border border-[#e2dbd4]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
