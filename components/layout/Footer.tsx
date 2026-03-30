import Link from "next/link";

const LINKS = {
  Espaces: [
    { label: "Paris", href: "/search?city=Paris" },
    { label: "Abidjan", href: "/search?city=Abidjan" },
    { label: "Bruxelles", href: "/search?city=Bruxelles" },
    { label: "Tous les espaces", href: "/search" },
  ],
  Occasions: [
    { label: "Mariage", href: "/search?q=mariage" },
    { label: "Séminaire", href: "/search?q=séminaire" },
    { label: "Anniversaire", href: "/search?q=anniversaire" },
    { label: "Tournage", href: "/search?q=tournage" },
  ],
  Plateforme: [
    { label: "Publier mon espace", href: "/register?type=owner" },
    { label: "Comment ça marche", href: "/#how" },
    { label: "CGU", href: "/legal/terms" },
    { label: "Confidentialité", href: "/legal/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1A1410] text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* ── Corps ── */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Marque */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5 no-underline group">
              {/* Pin raffiné */}
              <svg width="34" height="34" viewBox="0 0 38 38" fill="none" aria-hidden="true">
                <circle cx="19" cy="14" r="12.5" stroke="#C4622D" strokeWidth="0.7" fill="none" opacity="0.22"/>
                <path
                  d="M19 3C12.925 3 8 7.925 8 14C8 22.5 19 35 19 35C19 35 30 22.5 30 14C30 7.925 25.075 3 19 3Z"
                  fill="#C4622D"
                />
                <path
                  d="M19 5C13.925 5 10 8.925 10 14C10 21.2 19 32 19 32C19 32 28 21.2 28 14C28 8.925 24.075 5 19 5Z"
                  fill="white" opacity="0.08"
                />
                <circle cx="19" cy="14" r="7.5" stroke="#E8A838" strokeWidth="0.9" fill="none" opacity="0.45"/>
                <circle cx="19" cy="14" r="5.2" fill="#E8A838"/>
                <circle cx="19" cy="14" r="2" fill="#C4622D" opacity="0.5"/>
              </svg>

              {/* Wordmark */}
              <span
                className="text-lg tracking-tight text-white/80"
                style={{ fontFamily: "Playfair Display, serif", fontWeight: 400 }}
              >
                Nos<span
                  className="text-[#C4622D]"
                  style={{ fontWeight: 700, fontStyle: "italic" }}
                >coins</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-[220px]">
              L&apos;espace qui rassemble vos plus beaux moments.
            </p>
            {/* Marchés */}
            <div className="flex flex-col gap-2">
              {[
                { dot: "#C4622D", label: "France & Belgique" },
                { dot: "#E8A838", label: "Côte d'Ivoire" },
              ].map(({ dot, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
                  <span className="text-xs text-white/40">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Colonnes liens */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
                {title}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Barre basse ── */}
        <div className="border-t border-white/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-white/25">
            © {new Date().getFullYear()} Noscoins — Tous droits réservés
          </span>
          <div className="flex items-center gap-4 text-xs text-white/25">
            <Link href="/legal/terms" className="hover:text-white/60 transition-colors">CGU</Link>
            <Link href="/legal/privacy" className="hover:text-white/60 transition-colors">Confidentialité</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
