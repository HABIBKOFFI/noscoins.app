import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function getOwnerData(userId: string) {
  const [venues, pendingQuotes, recentBookings, wallet, unread] = await Promise.all([
    prisma.venue.findMany({
      where: { owner_id: userId },
      select: { id: true, name: true, city: true, status: true, _count: { select: { bookings: true } } },
    }),
    prisma.quote.count({
      where: { venue: { owner_id: userId }, status: "pending" },
    }),
    prisma.booking.findMany({
      where: { venue: { owner_id: userId } },
      include: { venue: { select: { name: true } }, user: { select: { email: true } } },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
    prisma.wallet.findFirst({ where: { user_id: userId } }),
    prisma.notification.count({ where: { user_id: userId, read_at: null } }),
  ]);

  const revenue = await prisma.payment.aggregate({
    where: {
      booking: { venue: { owner_id: userId } },
      status: "succeeded",
    },
    _sum: { amount: true },
  });

  return { venues, pendingQuotes, recentBookings, wallet, unread, revenue };
}

const VENUE_STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning",
  validated: "badge-or",
  published: "badge-success",
  suspended: "badge-error",
};
const VENUE_STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  validated: "Validé",
  published: "Publié",
  suspended: "Suspendu",
};

export default async function OwnerDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) redirect("/login");

  let userId: string;
  try {
    const payload = await verifyToken(token);
    if (payload.role !== "owner") redirect("/client");
    userId = payload.userId;
  } catch {
    redirect("/login");
  }

  const { venues, pendingQuotes, recentBookings, wallet, unread, revenue } = await getOwnerData(userId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
            Espace propriétaire
          </h1>
          <p className="text-sm text-[#1A1410]/60 mt-1">{venues.length} espace{venues.length > 1 ? "s" : ""}</p>
        </div>
        <Link href="/owner/venues/new" className="btn-primary text-sm px-4 py-2">
          + Ajouter un espace
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Devis en attente", value: pendingQuotes, href: "/owner/quotes", highlight: pendingQuotes > 0 },
          { label: "Réservations", value: recentBookings.length, href: "/owner/bookings", highlight: false },
          { label: "Revenus totaux", value: `${Number(revenue._sum.amount ?? 0).toLocaleString("fr-FR")} €`, href: "/owner/payouts", highlight: false },
          { label: "Notifications", value: unread, href: "/owner/notifications", highlight: unread > 0 },
        ].map(({ label, value, href, highlight }) => (
          <Link
            key={label}
            href={href}
            className={`bg-white rounded-xl border p-4 hover:border-[#C4622D] transition-colors ${highlight ? "border-[#C4622D]" : "border-[#ede7e0]"}`}
          >
            <p className={`text-2xl font-bold ${highlight ? "text-[#C4622D]" : "text-[#1A1410]"}`}>{value}</p>
            <p className="text-xs text-[#1A1410]/60 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Wallet CI */}
      {wallet && (
        <div className="bg-[#1A1410] text-white rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60 mb-1">Solde wallet</p>
            <p className="text-2xl font-bold">{Number(wallet.balance).toLocaleString("fr-FR")} {wallet.currency}</p>
          </div>
          <Link href="/owner/payouts" className="btn-secondary text-sm px-4 py-2 border-white/30 text-white hover:bg-white/10">
            Virement →
          </Link>
        </div>
      )}

      {/* Mes espaces */}
      <div className="bg-white rounded-xl border border-[#ede7e0] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1A1410]">Mes espaces</h2>
          <Link href="/owner/venues" className="text-sm text-[#C4622D] hover:underline">Voir tout</Link>
        </div>
        {venues.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-[#1A1410]/50 mb-3">Aucun espace créé</p>
            <Link href="/owner/venues/new" className="btn-primary text-sm px-5 py-2">Créer mon premier espace</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {venues.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#ede7e0] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1A1410]">{v.name}</p>
                  <p className="text-xs text-[#1A1410]/50">{v.city} · {v._count.bookings} réservation{v._count.bookings > 1 ? "s" : ""}</p>
                </div>
                <span className={`badge text-xs ${VENUE_STATUS_BADGE[v.status] ?? "badge-default"}`}>
                  {VENUE_STATUS_LABEL[v.status] ?? v.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Réservations récentes */}
      {recentBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-[#ede7e0] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1A1410]">Réservations récentes</h2>
            <Link href="/owner/bookings" className="text-sm text-[#C4622D] hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#ede7e0] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1A1410]">{b.venue.name}</p>
                  <p className="text-xs text-[#1A1410]/50">{b.user.email}</p>
                </div>
                <p className="text-sm font-semibold text-[#C4622D]">
                  {Number(b.total_price).toLocaleString("fr-FR")} {b.client_currency}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
