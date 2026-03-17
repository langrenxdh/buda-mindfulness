"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ZenCard from "@/components/ZenCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import { zenMessages } from "@/lib/messages";
import { ZenMessage } from "@/lib/types";

type Category = ZenMessage["category"] | "all";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const filteredMessages = useMemo(() => {
    return zenMessages.filter((msg) => {
      const matchesCategory = category === "all" || msg.category === category;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        msg.content.toLowerCase().includes(q) ||
        (msg.source?.toLowerCase().includes(q) ?? false) ||
        (msg.tags?.some((t) => t.toLowerCase().includes(q)) ?? false);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const counts = useMemo(() => {
    const base = zenMessages.filter((msg) => {
      const q = search.toLowerCase().trim();
      return (
        q === "" ||
        msg.content.toLowerCase().includes(q) ||
        (msg.source?.toLowerCase().includes(q) ?? false) ||
        (msg.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    });

    return {
      all: base.length,
      wisdom: base.filter((m) => m.category === "wisdom").length,
      mindfulness: base.filter((m) => m.category === "mindfulness").length,
      dharma: base.filter((m) => m.category === "dharma").length,
      practice: base.filter((m) => m.category === "practice").length,
    } as Record<Category, number>;
  }, [search]);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #e8f0e4 0%, #FAF8F5 60%)",
      }}
    >
      {/* Header */}
      <header className="pt-14 pb-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="text-5xl mb-3 select-none" aria-hidden="true">
            ☸
          </div>
          <h1
            className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1A2B1E] mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Buda
          </h1>
          <p className="text-[#6B7A6C] text-base md:text-lg font-light tracking-wide">
            Daily Wisdom &amp; Mindfulness
          </p>
        </motion.div>
      </header>

      {/* Controls */}
      <motion.div
        className="px-4 mb-10 flex flex-col gap-5 items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter
          selected={category}
          onSelect={setCategory}
          counts={counts}
        />
      </motion.div>

      {/* Card grid */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        {filteredMessages.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-[#6B7A6C]"
          >
            <p className="text-4xl mb-4 select-none">✦</p>
            <p className="text-lg font-light">No wisdom found for that search.</p>
            <p className="text-sm mt-1 opacity-70">Try a different term or clear the search.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMessages.map((msg, i) => (
              <ZenCard key={msg.id} message={msg} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-10 text-[#6B7A6C] text-sm font-light">
        <p>Cultivated with mindfulness</p>
      </footer>
    </div>
  );
}
