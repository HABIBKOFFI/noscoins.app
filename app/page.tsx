// Ne jamais prerender au build — la page requiert la DB au runtime
export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

async function getTopVenues() {
  return prisma.venue.findMany({
    where: { status: "published" },
    select: {
      id: true, name: true, city: true,
      base_price: true, currency: true, capacity_seat: true,
      reviews: { select: { score_overall: true } },
    },
    orderBy: { created_at: "desc" },
    take: 6,
  });
}

function formatPrice(price: number | null, currency: string | null) {
  if (!price) return "Sur devis";
  if (currency === "XOF") return `${price.toLocaleString("fr-FR")} FCFA`;
  return `${price.toLocaleString("fr-FR")} €`;
}

function avgScore(reviews: { score_overall: number | null }[]) {
  const valid = reviews.filter((r) => r.score_overall !== null);
  if (!valid.length) return null;
  return (valid.reduce((s, r) => s + r.score_overall!, 0) / valid.length).toFixed(1);
}

/* ─── Filigrane mandala hero (coordonnées pré-calculées, 600×600) ─── */
function HeroWatermark() {
  return (
    <svg
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(95vw,680px)] h-[min(95vw,680px)] pointer-events-none select-none"
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
      style={{ opacity: 0.055 }}
    >
      {/* Cercles concentriques */}
      <circle cx="300" cy="300" r="280" stroke="#C4622D" strokeWidth="0.9"/>
      <circle cx="300" cy="300" r="240" stroke="#C4622D" strokeWidth="0.35"/>
      <circle cx="300" cy="300" r="200" stroke="#C4622D" strokeWidth="0.8"/>
      <circle cx="300" cy="300" r="160" stroke="#C4622D" strokeWidth="0.35"/>
      <circle cx="300" cy="300" r="120" stroke="#C4622D" strokeWidth="0.7"/>
      <circle cx="300" cy="300" r="62"  stroke="#C4622D" strokeWidth="0.5"/>

      {/* Lignes radiales principales — 8 directions à 45° */}
      <line x1="360" y1="300" x2="580" y2="300" stroke="#C4622D" strokeWidth="0.55"/>
      <line x1="240" y1="300" x2="20"  y2="300" stroke="#C4622D" strokeWidth="0.55"/>
      <line x1="300" y1="360" x2="300" y2="580" stroke="#C4622D" strokeWidth="0.55"/>
      <line x1="300" y1="240" x2="300" y2="20"  stroke="#C4622D" strokeWidth="0.55"/>
      <line x1="342" y1="342" x2="498" y2="498" stroke="#C4622D" strokeWidth="0.55"/>
      <line x1="258" y1="342" x2="102" y2="498" stroke="#C4622D" strokeWidth="0.55"/>
      <line x1="258" y1="258" x2="102" y2="102" stroke="#C4622D" strokeWidth="0.55"/>
      <line x1="342" y1="258" x2="498" y2="102" stroke="#C4622D" strokeWidth="0.55"/>

      {/* Lignes intermédiaires — 22.5° (plus fines) */}
      <line x1="357" y1="324" x2="559" y2="407" stroke="#C4622D" strokeWidth="0.25"/>
      <line x1="323" y1="357" x2="407" y2="559" stroke="#C4622D" strokeWidth="0.25"/>
      <line x1="277" y1="357" x2="193" y2="559" stroke="#C4622D" strokeWidth="0.25"/>
      <line x1="243" y1="324" x2="41"  y2="407" stroke="#C4622D" strokeWidth="0.25"/>
      <line x1="243" y1="276" x2="41"  y2="193" stroke="#C4622D" strokeWidth="0.25"/>
      <line x1="277" y1="243" x2="193" y2="41"  stroke="#C4622D" strokeWidth="0.25"/>
      <line x1="323" y1="243" x2="407" y2="41"  stroke="#C4622D" strokeWidth="0.25"/>
      <line x1="357" y1="276" x2="559" y2="193" stroke="#C4622D" strokeWidth="0.25"/>

      {/* Losanges à r=200 — tous les 45° */}
      <path d="M500 293L507 300L500 307L493 300Z" fill="#C4622D"/>
      <path d="M441 434L448 441L441 448L434 441Z" fill="#C4622D"/>
      <path d="M300 493L307 500L300 507L293 500Z" fill="#C4622D"/>
      <path d="M159 434L166 441L159 448L152 441Z" fill="#C4622D"/>
      <path d="M100 293L107 300L100 307L93  300Z" fill="#C4622D"/>
      <path d="M159 152L166 159L159 166L152 159Z" fill="#C4622D"/>
      <path d="M300 93L307 100L300 107L293 100Z"  fill="#C4622D"/>
      <path d="M441 152L448 159L441 166L434 159Z" fill="#C4622D"/>

      {/* Petits cercles à r=120 — tous les 45° */}
      <circle cx="420" cy="300" r="2.8" fill="#C4622D"/>
      <circle cx="385" cy="385" r="2.8" fill="#C4622D"/>
      <circle cx="300" cy="420" r="2.8" fill="#C4622D"/>
      <circle cx="215" cy="385" r="2.8" fill="#C4622D"/>
      <circle cx="180" cy="300" r="2.8" fill="#C4622D"/>
      <circle cx="215" cy="215" r="2.8" fill="#C4622D"/>
      <circle cx="300" cy="180" r="2.8" fill="#C4622D"/>
      <circle cx="385" cy="215" r="2.8" fill="#C4622D"/>

      {/* Ornement central — pin Noscoins stylisé */}
      <path
        d="M300 264C284 264 271 277 271 293C271 314 300 340 300 340C300 340 329 314 329 293C329 277 316 264 300 264Z"
        stroke="#C4622D" strokeWidth="1.3" fill="none"
      />
      <circle cx="300" cy="293" r="10" stroke="#E8A838" strokeWidth="1.2" fill="none" opacity="0.7"/>
      <circle cx="300" cy="293" r="4"  fill="#E8A838"/>
    </svg>
  );
}

/* ─── Ornement de section (losange ── ◆ ──) ─── */
function SectionOrnament() {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="h-px w-14" style={{ background: "linear-gradient(to right, transparent, rgba(196,98,45,0.35))" }}/>
      <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
        <path d="M4.5 0L6 3L9 4.5L6 6L4.5 9L3 6L0 4.5L3 3Z" fill="#C4622D" opacity="0.5"/>
      </svg>
      <div className="h-px w-14" style={{ background: "linear-gradient(to left, transparent, rgba(196,98,45,0.35))" }}/>
    </div>
  );
}

// SVG icons ultra premium pour les catégories
const CATEGORIES = [
  {
    label: "Mariage", sub: "Salles & domaines", q: "mariage",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C14 4 9 9 9 13.5C9 16.537 11.239 19 14 19C16.761 19 19 16.537 19 13.5C19 9 14 4 14 4Z" fill="#C4622D" opacity="0.15" stroke="#C4622D" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M7 22H21" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 22L10 19" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 22L18 19" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="13" r="2" fill="#E8A838"/>
      </svg>
    ),
  },
  {
    label: "Séminaire", sub: "Salles de conférence", q: "séminaire",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="14" rx="2" fill="#C4622D" opacity="0.1" stroke="#C4622D" strokeWidth="1.5"/>
        <path d="M9 10H19" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 14H15" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 20V24" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 24H18" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Anniversaire", sub: "Lofts & rooftops", q: "anniversaire",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M7 18H21L19 12H9L7 18Z" fill="#C4622D" opacity="0.1" stroke="#C4622D" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 12V10C10 8.343 11.343 7 13 7" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 12V10C18 8.343 16.657 7 15 7" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="6" r="1.5" fill="#E8A838"/>
        <path d="M7 18V22H21V18" stroke="#C4622D" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Tournage", sub: "Studios & lofts", q: "tournage",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="9" width="15" height="11" rx="2" fill="#C4622D" opacity="0.1" stroke="#C4622D" strokeWidth="1.5"/>
        <path d="M19 12L24 10V19L19 17" stroke="#C4622D" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="10" cy="14" r="2" fill="#E8A838" opacity="0.8"/>
      </svg>
    ),
  },
  {
    label: "Soirée", sub: "Clubs & terrasses", q: "soirée",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 5L15.5 10H21L16.5 13L18 18L14 15L10 18L11.5 13L7 10H12.5L14 5Z" fill="#C4622D" opacity="0.15" stroke="#C4622D" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="14" cy="12" r="2" fill="#E8A838"/>
      </svg>
    ),
  },
  {
    label: "Exposition", sub: "Galeries & showrooms", q: "exposition",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="5" width="18" height="14" rx="1.5" fill="#C4622D" opacity="0.1" stroke="#C4622D" strokeWidth="1.5"/>
        <rect x="9" y="9" width="5" height="6" rx="1" fill="#E8A838" opacity="0.6"/>
        <rect x="16" y="9" width="3" height="3" rx="0.5" fill="#C4622D" opacity="0.4"/>
        <path d="M5 22H23" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Formation", sub: "Espaces de travail", q: "formation",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 5L4 10L14 15L24 10L14 5Z" fill="#C4622D" opacity="0.1" stroke="#C4622D" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 13V18C8 18 10 21 14 21C18 21 20 18 20 18V13" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M24 10V16" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Sport & Bien-être", sub: "Salles & espaces outdoor", q: "sport",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" fill="#C4622D" opacity="0.08" stroke="#C4622D" strokeWidth="1.5"/>
        <path d="M10 14C10 11.791 11.791 10 14 10C16.209 10 18 11.791 18 14" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 14C10 16.209 11.791 18 14 18C16.209 18 18 16.209 18 14" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// Illustration statistiques
function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl md:text-3xl font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
        {value}
      </span>
      <span className="text-xs text-[#1A1410]/50 text-center">{label}</span>
    </div>
  );
}

export default async function HomePage() {
  const venues = await getTopVenues();

  return (
    <div className="min-h-screen bg-[#FBF5F0] flex flex-col">
      <Header />

      <main className="flex-1">

        {/* ━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━ */}
        <section className="relative overflow-hidden">
          {/* Fond avec motif et dégradé */}
          <div className="absolute inset-0 brand-pattern opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FBF5F0] via-[#FBF5F0]/95 to-[#FBF5F0]" />

          {/* Accents dégradés */}
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #C4622D 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-8 pointer-events-none"
            style={{ background: "radial-gradient(circle, #E8A838 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
          />

          {/* ── Filigrane mandala ── */}
          <HeroWatermark />

          <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-20 pb-10 md:pt-28 md:pb-14 text-center">

            {/* Pill */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#ede7e0] rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4622D] animate-pulse" />
              <span className="text-xs font-medium text-[#1A1410]/70 tracking-wide">
                France · Belgique · Côte d&apos;Ivoire
              </span>
            </div>

            {/* Titre */}
            <h1
              className="text-4xl sm:text-5xl md:text-[64px] font-bold text-[#1A1410] leading-[1.1] mb-6 tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              L&apos;espace qui rassemble
              <br />
              <span className="text-[#C4622D] italic">vos plus beaux moments.</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-base sm:text-lg text-[#1A1410]/60 max-w-xl mx-auto mb-10 leading-relaxed">
              Réservez des espaces événementiels d&apos;exception pour vos mariages, séminaires,
              anniversaires et tournages en quelques clics, sans intermédiaire.
            </p>

            {/* Barre de recherche premium */}
            <form
              action="/search"
              method="get"
              className="flex flex-col sm:flex-row items-stretch gap-2 max-w-lg mx-auto bg-white border border-[#ede7e0] rounded-2xl p-2 shadow-lg shadow-[#C4622D]/5"
            >
              <div className="flex items-center gap-3 flex-1 px-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4622D" strokeWidth="2" strokeLinecap="round" className="shrink-0 opacity-60">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  name="city"
                  type="text"
                  placeholder="Paris, Abidjan, Bruxelles…"
                  className="w-full py-2.5 text-sm text-[#1A1410] bg-transparent outline-none placeholder-[#1A1410]/30"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                className="btn-primary text-sm px-7 py-3 rounded-xl shrink-0"
              >
                Rechercher
              </button>
            </form>

            {/* Liens rapides */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <span className="text-xs text-[#1A1410]/30">Populaires :</span>
              {["Paris", "Abidjan", "Mariage", "Séminaire"].map((t) => (
                <Link
                  key={t}
                  href={`/search?city=${t}`}
                  className="text-xs font-medium text-[#1A1410]/50 hover:text-[#C4622D] bg-white border border-[#ede7e0] rounded-full px-3 py-1 transition-colors hover:border-[#C4622D]/30"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pb-16">
            <div className="bg-white rounded-2xl border border-[#ede7e0] shadow-sm px-6 py-6 grid grid-cols-3 gap-4 divide-x divide-[#ede7e0]">
              <StatBadge value="60+" label="Espaces vérifiés" />
              <StatBadge value="3" label="Pays couverts" />
              <StatBadge value="0€" label="Frais d'inscription" />
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━ CATÉGORIES ━━━━━━━━━━━━━━━━ */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center mb-12">
            <SectionOrnament />
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C4622D] mb-3">Occasions</p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1A1410]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Pour chaque moment de vie
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {CATEGORIES.map(({ label, sub, q, icon }) => (
              <Link
                key={q}
                href={`/search?q=${q}`}
                className="group relative bg-white rounded-2xl border border-[#ede7e0] p-5 md:p-6 flex flex-col gap-4 hover:border-[#C4622D]/40 hover:shadow-md hover:shadow-[#C4622D]/5 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FBF5F0] flex items-center justify-center group-hover:bg-[#C4622D]/5 transition-colors">
                  {icon}
                </div>
                <div>
                  <p className="font-semibold text-[#1A1410] text-sm leading-snug">{label}</p>
                  <p className="text-xs text-[#1A1410]/40 mt-0.5">{sub}</p>
                </div>
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#FBF5F0] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#C4622D" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 10L10 2M10 2H4M10 2V8" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━ ESPACES ━━━━━━━━━━━━━━━━ */}
        <section className="bg-white border-y border-[#ede7e0] py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <SectionOrnament />
                <p className="text-xs font-semibold uppercase tracking-widest text-[#C4622D] mb-3">Sélection</p>
                <h2
                  className="text-3xl md:text-4xl font-bold text-[#1A1410]"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Espaces populaires
                </h2>
              </div>
              <Link
                href="/search"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#C4622D] hover:text-[#a84f24] transition-colors"
              >
                Voir tout
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>

            {venues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {venues.map((venue, i) => {
                  const score = avgScore(venue.reviews);
                  // Couleurs de fond alternées pour les placeholders
                  const palettes = [
                    { from: "#f5ece4", to: "#ede0d4" },
                    { from: "#e8e4f0", to: "#d8d0e4" },
                    { from: "#e4eee8", to: "#d4e4da" },
                  ];
                  const pal = palettes[i % 3];
                  return (
                    <Link
                      key={venue.id}
                      href={`/venues/${venue.id}`}
                      className="group bg-[#FBF5F0] rounded-2xl overflow-hidden border border-[#ede7e0] hover:shadow-xl hover:shadow-[#1A1410]/8 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      {/* Image placeholder */}
                      <div
                        className="relative h-52 flex items-center justify-center overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${pal.from} 0%, ${pal.to} 100%)` }}
                      >
                        {/* Motif décoratif */}
                        <div className="absolute inset-0 brand-pattern opacity-40" />
                        {/* Icône pin central */}
                        <svg
                          className="relative z-10 opacity-25 group-hover:opacity-35 group-hover:scale-110 transition-all duration-300"
                          width="56" height="56" viewBox="0 0 36 36" fill="none"
                        >
                          <path d="M18 3C12.201 3 7.5 7.701 7.5 13.5C7.5 21.75 18 33 18 33C18 33 28.5 21.75 28.5 13.5C28.5 7.701 23.799 3 18 3Z" fill="#C4622D"/>
                          <circle cx="18" cy="13.5" r="5" fill="#E8A838"/>
                        </svg>
                        {/* Badge ville */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#C4622D" strokeWidth="2" strokeLinecap="round">
                            <circle cx="6" cy="5" r="2"/><path d="M6 1C3.791 1 2 2.791 2 5C2 7.5 6 11 6 11C6 11 10 7.5 10 5C10 2.791 8.209 1 6 1Z"/>
                          </svg>
                          <span className="text-xs font-medium text-[#1A1410]">{venue.city}</span>
                        </div>
                        {/* Score */}
                        {score && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="#E8A838">
                              <path d="M6 1L7.5 4.5H11L8.25 6.75L9.25 10.5L6 8.5L2.75 10.5L3.75 6.75L1 4.5H4.5L6 1Z"/>
                            </svg>
                            <span className="text-xs font-bold text-[#1A1410]">{score}</span>
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div>
                          <h3
                            className="font-bold text-[#1A1410] text-base leading-snug mb-1"
                            style={{ fontFamily: "Playfair Display, serif" }}
                          >
                            {venue.name}
                          </h3>
                          <p className="text-xs text-[#1A1410]/50 flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <circle cx="6" cy="5" r="2"/><path d="M6 1C3.791 1 2 2.791 2 5C2 7.5 6 11 6 11C6 11 10 7.5 10 5C10 2.791 8.209 1 6 1Z"/>
                            </svg>
                            {venue.city}
                            {venue.capacity_seat ? ` · Jusqu'à ${venue.capacity_seat} pers.` : ""}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#ede7e0]">
                          <div>
                            <p className="text-[10px] text-[#1A1410]/40 uppercase tracking-wide">À partir de</p>
                            <p className="text-base font-bold text-[#C4622D]">
                              {formatPrice(Number(venue.base_price), venue.currency)}
                            </p>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-[#C4622D]/5 flex items-center justify-center group-hover:bg-[#C4622D] transition-colors">
                            <svg className="text-[#C4622D] group-hover:text-white transition-colors" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M3 8h10M9 4l4 4-4 4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d1c7bf] p-20 text-center">
                <p className="text-[#1A1410]/30 text-sm">Les premiers espaces arrivent bientôt.</p>
              </div>
            )}

            <div className="text-center mt-10">
              <Link href="/search" className="btn-secondary px-8 py-3 text-sm">
                Voir tous les espaces
              </Link>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━ COMMENT ÇA MARCHE ━━━━━━━━━━━━━━━━ */}
        <section className="bg-[#FBF5F0] py-24" id="how">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-16">
              <SectionOrnament />
              <p className="text-xs font-semibold uppercase tracking-widest text-[#C4622D] mb-3">Processus</p>
              <h2
                className="text-3xl md:text-4xl font-bold text-[#1A1410]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Réservez en 3 étapes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {[
                {
                  num: "01",
                  title: "Trouvez",
                  desc: "Recherchez parmi nos espaces vérifiés par ville, capacité ou occasion. Filtrez et comparez.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4622D" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                  ),
                },
                {
                  num: "02",
                  title: "Réservez",
                  desc: "Réservation instantanée ou sur demande. Le propriétaire répond sous 48h. Négociation possible.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4622D" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                  ),
                },
                {
                  num: "03",
                  title: "Payez",
                  desc: "Acompte de 30% sécurisé. Carte bancaire en Europe, mobile money en Côte d'Ivoire.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4622D" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                    </svg>
                  ),
                },
              ].map(({ num, title, desc, icon }) => (
                <div key={num} className="bg-white rounded-2xl border border-[#ede7e0] p-8 flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FBF5F0] border border-[#ede7e0] flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <span
                      className="text-3xl font-bold text-[#1A1410]/10"
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      {num}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1410] text-lg mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                      {title}
                    </h3>
                    <p className="text-sm text-[#1A1410]/50 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/search" className="btn-primary px-10 py-3.5 text-sm">
                Trouver mon espace
              </Link>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━ CTA PROPRIÉTAIRE ━━━━━━━━━━━━━━━━ */}
        <section className="py-24 px-5 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-[#C4622D] to-[#a84f24] rounded-3xl overflow-hidden">
              {/* Filigrane CTA */}
              <div className="absolute inset-0 filigree-grid opacity-30" />
              {/* Cercle déco */}
              <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/5" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-black/10" />

              <div className="relative z-10 px-8 sm:px-14 py-14 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                <div className="max-w-lg">
                  <div className="flex items-center gap-2 mb-5">
                    <svg width="20" height="20" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                      <path d="M18 3C12.201 3 7.5 7.701 7.5 13.5C7.5 21.75 18 33 18 33C18 33 28.5 21.75 28.5 13.5C28.5 7.701 23.799 3 18 3Z" fill="white" opacity="0.5"/>
                      <circle cx="18" cy="13.5" r="5" fill="#E8A838"/>
                    </svg>
                    <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Propriétaires</span>
                  </div>
                  <h2
                    className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Vous avez un espace à louer ?
                  </h2>
                  <p className="text-white/70 text-base leading-relaxed">
                    Rejoignez Noscoins et touchez des clients qualifiés à Paris, Bruxelles et Abidjan.
                    <strong className="text-white"> Aucun frais fixe</strong> — commission uniquement sur vos réservations confirmées.
                  </p>
                </div>

                <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                  <Link
                    href="/register?type=owner"
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#C4622D] font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#FBF5F0] transition-colors whitespace-nowrap"
                  >
                    Publier mon espace
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                  <p className="text-white/40 text-xs text-center">Gratuit · Sans engagement</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
