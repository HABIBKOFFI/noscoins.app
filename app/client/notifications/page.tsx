export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

// In production this would use the authenticated user's ID from JWT
async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    take: 50,
  });
}

const DEMO_NOTIFICATIONS = [
  {
    id: "1",
    type: "booking_confirmed",
    title: "Réservation confirmée",
    body: "Votre réservation au Loft Marais pour le 15 avril a été confirmée.",
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    type: "payment_received",
    title: "Paiement enregistré",
    body: "Votre acompte de 360€ a bien été reçu. Confirmation par email.",
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    type: "new_message",
    title: "Nouveau message",
    body: "Le propriétaire du Loft Marais vous a envoyé un message.",
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "4",
    type: "quote_response",
    title: "Réponse à votre devis",
    body: "Villa Cocody a répondu à votre demande de devis. Consultez la réponse.",
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "5",
    type: "lock_expired",
    title: "Créneau expiré",
    body: "Votre réservation pour Villa Cocody a expiré. Le créneau est à nouveau disponible.",
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 48),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

const ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  booking_confirmed: { icon: "✓", bg: "bg-green-100", color: "text-green-600" },
  payment_received: { icon: "€", bg: "bg-[#E8A838]/20", color: "text-[#E8A838]" },
  new_message: { icon: "✉", bg: "bg-blue-100", color: "text-blue-600" },
  quote_response: { icon: "📋", bg: "bg-purple-100", color: "text-purple-600" },
  lock_expired: { icon: "⏱", bg: "bg-red-100", color: "text-red-500" },
};

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function ClientNotificationsPage() {
  const unreadCount = DEMO_NOTIFICATIONS.filter((n) => !n.read_at).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[#1A1410]/50 mt-1">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="text-sm text-[#C4622D] hover:underline">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {DEMO_NOTIFICATIONS.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#ede7e0]">
          <div className="w-12 h-12 rounded-full bg-[#FBF5F0] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔔</span>
          </div>
          <p className="text-[#1A1410]/50">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {DEMO_NOTIFICATIONS.map((notif) => {
            const style = ICONS[notif.type] ?? { icon: "•", bg: "bg-gray-100", color: "text-gray-500" };
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl border p-4 flex gap-4 cursor-pointer hover:shadow-sm transition-shadow ${
                  !notif.read_at ? "border-[#C4622D]/20 bg-[#FBF5F0]" : "border-[#ede7e0]"
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0 text-lg`}>
                  <span className={style.color}>{style.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium text-[#1A1410] ${!notif.read_at ? "font-semibold" : ""}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-[#1A1410]/40 whitespace-nowrap flex-shrink-0">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-[#1A1410]/60 mt-0.5 leading-snug">{notif.body}</p>
                </div>
                {!notif.read_at && (
                  <div className="w-2 h-2 rounded-full bg-[#C4622D] flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
