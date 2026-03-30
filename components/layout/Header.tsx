"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/search", label: "Espaces" },
  { href: "/search?q=mariage", label: "Mariage" },
  { href: "/search?q=séminaire", label: "Séminaire" },
  { href: "/register?type=owner", label: "Louer mon espace" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#ede7e0]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-8">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 shrink-0 no-underline group">
          {/* Pin raffiné */}
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
            {/* Halo extérieur */}
            <circle cx="19" cy="14" r="12.5" stroke="#C4622D" strokeWidth="0.7" fill="none" opacity="0.22"/>
            {/* Corps du pin */}
            <path
              d="M19 3C12.925 3 8 7.925 8 14C8 22.5 19 35 19 35C19 35 30 22.5 30 14C30 7.925 25.075 3 19 3Z"
              fill="#C4622D"
            />
            {/* Reflet interne */}
            <path
              d="M19 5C13.925 5 10 8.925 10 14C10 21.2 19 32 19 32C19 32 28 21.2 28 14C28 8.925 24.075 5 19 5Z"
              fill="white" opacity="0.08"
            />
            {/* Anneau or externe */}
            <circle cx="19" cy="14" r="7.5" stroke="#E8A838" strokeWidth="0.9" fill="none" opacity="0.45"/>
            {/* Disque or */}
            <circle cx="19" cy="14" r="5.2" fill="#E8A838"/>
            {/* Point central terracotta */}
            <circle cx="19" cy="14" r="2" fill="#C4622D" opacity="0.5"/>
          </svg>

          {/* Wordmark */}
          <span
            className="text-[1.35rem] tracking-tight text-[#1A1410]/80 group-hover:text-[#1A1410] transition-colors leading-none"
            style={{ fontFamily: "Playfair Display, serif", fontWeight: 400 }}
          >
            Nos<span
              className="text-[#C4622D]"
              style={{ fontWeight: 700, fontStyle: "italic" }}
            >coins</span>
          </span>
        </Link>

        {/* ── Nav desktop ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-[#1A1410]/70 hover:text-[#C4622D] hover:bg-[#C4622D]/5 px-4 py-2 rounded-lg transition-all"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Actions desktop ── */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-[#1A1410]/70 hover:text-[#1A1410] px-4 py-2 rounded-lg transition-colors"
          >
            Connexion
          </Link>
          <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
            Commencer
          </Link>
        </div>

        {/* ── Burger mobile ── */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[#1A1410] hover:bg-[#FBF5F0] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="8" x2="21" y2="8" />
                <line x1="3" y1="16" x2="21" y2="16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* ── Menu mobile ── */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#ede7e0] px-5 py-5 flex flex-col gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#1A1410]/80 py-3 px-4 rounded-xl hover:bg-[#FBF5F0] hover:text-[#C4622D] transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#ede7e0]">
            <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost text-sm flex-1 text-center py-2.5">
              Connexion
            </Link>
            <Link href="/register" onClick={() => setOpen(false)} className="btn-primary text-sm flex-1 text-center py-2.5">
              Commencer
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
