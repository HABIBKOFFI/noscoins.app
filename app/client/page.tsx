import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function getClientData(userId: string) {
  const [bookings, notifications, favorites] = await Promise.all([
    prisma.booking.findMany({
      where: { user_id: userId },
      include: { venue: { select: { name: true, city: true } } },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
    prisma.notification.count({ where: { user_id: userId, read_at: null } }),
    prisma.favorite.count({ where: { user_id: userId } }),
  ]);
  return { bookings, unreadNotifications: notifications, favoritesCount: favorites };
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  locked: "En attente de paiement",
  confirmed: "Confirmée",
  paid: "Payée",
  completed: "Terminée",
  cancelled: "Annulée",
};

const STATUS_BADGE: Record<string, string> = {
  draft: "badge-default",
  locked: "badge-warning",
  confirmed: "badge-or",
  paid: "badge-success",
  completed: "badge-success",
  cancelled: "badge-error",
};

export default async function ClientDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) redirect("/login");

  let userId: string;
  try {
    const payload = await verifyToken(token);
    userId = payload.userId;
  } catch {
    redirect("/login");
  }

  const { bookings, unreadNotifications, favoritesCount } = await getClientData(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
          Mon espace
        </h1>
        <p className="text-sm text-[#1A1410]/60 mt-1">Bienvenue sur votre tableau de bord</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Réservations", value: bookings.length, href: "/client/bookings" },
          { label: "Favoris", value: favoritesCount, href: "/client/favorites" },
          { label: "Notifications", value: unreadNotifications, href: "/client/notifications" },
        ].map(({ label, value, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-[#ede7e0] p-4 hover:border-[#C4622D] transition-colors">
            <p className="text-2xl font-bold text-[#C4622D]">{value}</p>
            <p className="text-sm text-[#1A1410]/60">{label}</p>
          </Link>
        ))}
      </div>

      {/* Réservations récentes */}
      <div className="bg-white rounded-xl border border-[#ede7e0] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1A1410]">Réservations récentes</h2>
          <Link href="/client/bookings" className="text-sm text-[#C4622D] hover:underline">
            Voir tout
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#1A1410]/50 text-sm mb-4">Aucune réservation pour le moment</p>
            <Link href="/search" className="btn-primary text-sm px-6 py-2">
              Trouver un espace
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#ede7e0] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1A1410]">{b.venue.name}</p>
                  <p className="text-xs text-[#1A1410]/50">{b.venue.city}</p>
                </div>
                <span className={`badge text-xs ${STATUS_BADGE[b.status] ?? "badge-default"}`}>
                  {STATUS_LABELS[b.status] ?? b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <Link href="/search" className="btn-secondary w-full text-center block">
        Trouver un nouvel espace
      </Link>
    </div>
  );
}
