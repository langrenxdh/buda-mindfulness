"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const t = useTranslations("search");
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7A6C] pointer-events-none"
        size={18}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full pl-11 pr-4 py-3 rounded-full border border-[#e2dbd4] bg-white text-[#2D3A2E] placeholder-[#6B7A6C] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B9A7D] focus:border-transparent transition-all duration-200 shadow-sm"
      />
    </div>
  );
}
