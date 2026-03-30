import Link from "next/link";

const NAV = [
  { href: "/client", label: "Tableau de bord" },
  { href: "/client/bookings", label: "Mes réservations" },
  { href: "/client/favorites", label: "Favoris" },
  { href: "/client/messages", label: "Messages" },
  { href: "/client/profile", label: "Profil" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBF5F0]">
      {/* Header dashboard */}
      <header className="bg-white border-b border-[#ede7e0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C11.582 4 8 7.582 8 12C8 18.5 16 28 16 28C16 28 24 18.5 24 12C24 7.582 20.418 4 16 4Z" fill="#C4622D" />
              <circle cx="16" cy="12" r="4" fill="#E8A838" />
            </svg>
            <span className="text-sm font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>Noscoins</span>
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D] transition-colors">
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar nav */}
        <aside className="hidden md:flex flex-col gap-1 w-48 shrink-0">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm px-3 py-2 rounded-lg text-[#1A1410]/70 hover:bg-[#C4622D]/10 hover:text-[#C4622D] transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
        </aside>

        {/* Contenu */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
