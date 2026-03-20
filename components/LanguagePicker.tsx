"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/lib/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LOCALES = [
  { code: "en", flag: "🇺🇸" },
  { code: "zh", flag: "🇨🇳" },
  { code: "es", flag: "🇪🇸" },
  { code: "ja", flag: "🇯🇵" },
] as const;

export default function LanguagePicker() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Restore language preference from localStorage on first load
  useEffect(() => {
    const stored = localStorage.getItem("buda-locale");
    if (stored && stored !== locale) {
      router.replace(pathname, { locale: stored });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function switchLocale(next: string) {
    localStorage.setItem("buda-locale", next);
    router.replace(pathname, { locale: next });
    setIsOpen(false);
  }

  const current = LOCALES.find((l) => l.code === locale);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-[#6B7A6C] border border-[#8B9A7D]/30 bg-white/70 backdrop-blur-sm hover:border-[#8B9A7D] hover:text-[#4a5e3a] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B9A7D]"
        aria-label={t("select")}
        aria-expanded={isOpen}
      >
        <Globe size={14} className="shrink-0" />
        <span className="hidden sm:inline">{current?.flag}</span>
        <span className="hidden sm:inline">{t(locale as never)}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 min-w-[140px] bg-white rounded-xl shadow-lg border border-[#e2dbd4] overflow-hidden z-50"
          >
            {LOCALES.map(({ code, flag }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-150 ${
                  code === locale
                    ? "bg-[#8B9A7D]/10 text-[#4a5e3a] font-medium"
                    : "text-[#2D3A2E] hover:bg-[#FAF8F5]"
                }`}
              >
                <span className="text-base">{flag}</span>
                <span className="flex-1 text-left">{t(code as never)}</span>
                {code === locale && (
                  <Check size={14} className="text-[#8B9A7D] shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
