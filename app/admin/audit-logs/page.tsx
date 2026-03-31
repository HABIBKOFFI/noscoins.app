export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

async function getAuditLogs() {
  return prisma.auditLog.findMany({
    include: { actor: { select: { email: true, type: true } } },
    orderBy: { created_at: "desc" },
    take: 100,
  }).catch(() => []);
}

const DEMO_LOGS = [
  {
    id: "al1",
    actor: { email: "admin@noscoins.com", type: "admin" },
    action: "venue.published",
    target_type: "Venue",
    target_id: "venue-1",
    metadata: { venue_name: "Loft Marais", previous_status: "validated" },
    ip_address: "82.66.12.45",
    created_at: new Date("2026-03-31T10:22:00"),
  },
  {
    id: "al2",
    actor: { email: "admin@noscoins.com", type: "admin" },
    action: "document.approved",
    target_type: "Document",
    target_id: "doc-1",
    metadata: { doc_type: "identity", user_email: "owner.paris@noscoins.com" },
    ip_address: "82.66.12.45",
    created_at: new Date("2026-03-30T15:10:00"),
  },
  {
    id: "al3",
    actor: { email: "admin@noscoins.com", type: "admin" },
    action: "user.suspended",
    target_type: "User",
    target_id: "user-99",
    metadata: { reason: "Tentative de contournement de plateforme", suspended_until: "2026-04-30" },
    ip_address: "82.66.12.45",
    created_at: new Date("2026-03-29T09:05:00"),
  },
  {
    id: "al4",
    actor: { email: "admin@noscoins.com", type: "admin" },
    action: "config.updated",
    target_type: "Config",
    target_id: null,
    metadata: { key: "commission_rate_eu", old_value: "0.10", new_value: "0.12" },
    ip_address: "82.66.12.45",
    created_at: new Date("2026-03-28T14:00:00"),
  },
  {
    id: "al5",
    actor: { email: "system", type: "admin" },
    action: "booking.lock_expired",
    target_type: "Booking",
    target_id: "b-expired",
    metadata: { venue_name: "Rooftop Bastille", client_email: "client3@noscoins.com" },
    ip_address: null,
    created_at: new Date("2026-03-28T08:15:00"),
  },
  {
    id: "al6",
    actor: { email: "owner.paris@noscoins.com", type: "owner" },
    action: "venue.updated",
    target_type: "Venue",
    target_id: "venue-1",
    metadata: { fields_changed: ["base_price", "description"] },
    ip_address: "92.184.33.10",
    created_at: new Date("2026-03-27T11:30:00"),
  },
  {
    id: "al7",
    actor: { email: "admin@noscoins.com", type: "admin" },
    action: "payment.refunded",
    target_type: "Payment",
    target_id: "pay3",
    metadata: { amount: 360, currency: "EUR", reason: "Annulation > 30 jours" },
    ip_address: "82.66.12.45",
    created_at: new Date("2026-03-10T11:05:00"),
  },
];

const ACTION_COLORS: Record<string, string> = {
  "venue.published":       "bg-green-100 text-green-700",
  "venue.suspended":       "bg-red-100 text-red-600",
  "venue.updated":         "bg-blue-100 text-blue-700",
  "document.approved":     "bg-green-100 text-green-700",
  "document.rejected":     "bg-red-100 text-red-600",
  "user.suspended":        "bg-red-100 text-red-600",
  "user.blacklisted":      "bg-red-200 text-red-800",
  "config.updated":        "bg-yellow-100 text-yellow-700",
  "booking.lock_expired":  "bg-orange-100 text-orange-700",
  "payment.refunded":      "bg-purple-100 text-purple-700",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-[#C4622D]/10 text-[#C4622D]",
  owner: "bg-blue-100 text-blue-700",
  client: "bg-gray-100 text-gray-600",
};

export default async function AdminAuditLogsPage() {
  const logs = DEMO_LOGS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1A1410] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        Journal d&apos;audit
      </h1>
      <p className="text-sm text-[#1A1410]/50 mb-6">Historique de toutes les actions sensibles sur la plateforme.</p>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-[#ede7e0] p-4 mb-6">
        <form className="flex flex-col sm:flex-row gap-3">
          <input name="q" placeholder="Action, email acteur, target_id…" className="input flex-1 text-sm" />
          <select name="action" className="input w-full sm:w-48 text-sm">
            <option value="">Toutes actions</option>
            <option value="venue">Espaces</option>
            <option value="document">Documents</option>
            <option value="user">Utilisateurs</option>
            <option value="config">Configuration</option>
            <option value="booking">Réservations</option>
            <option value="payment">Paiements</option>
          </select>
          <input name="from" type="date" className="input w-full sm:w-36 text-sm" />
          <input name="to" type="date" className="input w-full sm:w-36 text-sm" />
          <button type="submit" className="btn-primary text-sm px-5">Filtrer</button>
        </form>
      </div>

      {/* Logs */}
      <div className="space-y-2">
        {logs.map((log) => {
          const actionColor = ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600";
          const roleColor = ROLE_COLORS[log.actor.type] ?? "bg-gray-100 text-gray-600";
          return (
            <div key={log.id} className="bg-white rounded-2xl border border-[#ede7e0] p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium font-mono ${actionColor}`}>
                    {log.action}
                  </span>
                  <span className="text-sm text-[#1A1410]">{log.actor.email}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor}`}>{log.actor.type}</span>
                  {log.target_type && (
                    <span className="text-xs text-[#1A1410]/40">
                      → {log.target_type}{log.target_id ? ` #${log.target_id.slice(0, 8)}` : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#1A1410]/40 flex-shrink-0">
                  {log.ip_address && <span>{log.ip_address}</span>}
                  <span>
                    {new Date(log.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-2 ml-0 flex flex-wrap gap-2">
                  {Object.entries(log.metadata as Record<string, unknown>).map(([k, v]) => (
                    <span key={k} className="text-xs bg-[#FBF5F0] text-[#1A1410]/60 px-2 py-0.5 rounded-lg">
                      {k}: <strong>{String(v)}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {logs.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#ede7e0]">
          <p className="text-[#1A1410]/50">Aucun log d&apos;audit disponible.</p>
        </div>
      )}
    </div>
  );
}
