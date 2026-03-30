import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBF5F0] flex flex-col">
      {/* Mini header */}
      <header className="bg-white border-b border-[#ede7e0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 4C11.582 4 8 7.582 8 12C8 18.5 16 28 16 28C16 28 24 18.5 24 12C24 7.582 20.418 4 16 4Z"
                fill="#C4622D"
              />
              <circle cx="16" cy="12" r="4" fill="#E8A838" />
            </svg>
            <span className="text-base font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
              Noscoins
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
