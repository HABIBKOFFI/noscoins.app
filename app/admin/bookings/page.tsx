export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

async function getBookings() {
  return prisma.booking.findMany({
    include: {
      venue: { select: { name: true, city: true } },
      user: { select: { email: true } },
    },
    orderBy: { created_at: "desc" },
    take: 50,
  }).catch(() => []);
}

const DEMO_BOOKINGS = [
  {
    id: "b1",
    venue: { name: "Loft Marais", city: "Paris" },
    user: { email: "client@noscoins.com" },
    status: "paid",
    total_price: 1500,
    deposit_amount: 450,
    service_fee_amount: 50,
    client_currency: "EUR",
    created_at: new Date("2026-03-20"),
    expires_at: null,
  },
  {
    id: "b2",
    venue: { name: "Villa Cocody", city: "Abidjan" },
    user: { email: "client2@noscoins.com" },
    status: "confirmed",
    total_price: 350000,
    deposit_amount: 105000,
    service_fee_amount: 10000,
    client_currency: "XOF",
    created_at: new Date("2026-03-22"),
    expires_at: null,
  },
  {
    id: "b3",
    venue: { name: "Rooftop Bastille", city: "Paris" },
    user: { email: "client3@noscoins.com" },
    status: "locked",
    total_price: 800,
    deposit_amount: 240,
    service_fee_amount: 50,
    client_currency: "EUR",
    created_at: new Date("2026-03-28"),
    expires_at: new Date(Date.now() + 1000 * 60 * 8),
  },
  {
    id: "b4",
    venue: { name: "Loft Marais", city: "Paris" },
    user: { email: "client4@noscoins.com" },
    status: "cancelled",
    total_price: 1200,
    deposit_amount: 360,
    service_fee_amount: 50,
    client_currency: "EUR",
    created_at: new Date("2026-03-10"),
    expires_at: null,
  },
  {
    id: "b5",
    venue: { name: "Villa Cocody", city: "Abidjan" },
    user: { email: "client5@noscoins.com" },
    status: "completed",
    total_price: 280000,
    deposit_amount: 84000,
    service_fee_amount: 10000,
    client_currency: "XOF",
    created_at: new Date("2026-02-01"),
    expires_at: null,
  },
];

const STATUS_UI: Record<string, { label: string; color: string }> = {
  draft:     { label: "Brouillon",  color: "bg-gray-100 text-gray-500" },
  locked:    { label: "Verrouillé", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmé",   color: "bg-blue-100 text-blue-700" },
  paid:      { label: "Payé",       color: "bg-green-100 text-green-700" },
  completed: { label: "Terminé",    color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Annulé",     color: "bg-red-100 text-red-600" },
};

function formatPrice(amount: number | null, currency: string | null) {
  if (!amount) return "—";
  if (currency === "XOF") return `${Number(amount).toLocaleString("fr-FR")} FCFA`;
  return `${Number(amount).toLocaleString("fr-FR")} €`;
}

export default async function AdminBookingsPage() {
  const bookings = DEMO_BOOKINGS;
  const stats = {
    total: bookings.length,
    paid: bookings.filter((b) => b.status === "paid" || b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    active: bookings.filter((b) => ["locked", "confirmed"].includes(b.status)).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1A1410] mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
        Réservations
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "text-[#1A1410]" },
          { label: "Actives", value: stats.active, color: "text-blue-600" },
          { label: "Payées", value: stats.paid, color: "text-green-600" },
          { label: "Annulées", value: stats.cancelled, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#ede7e0] p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[#1A1410]/50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-[#ede7e0] p-4 mb-6">
        <form className="flex flex-col sm:flex-row gap-3">
          <input name="q" placeholder="Email client, espace…" className="input flex-1 text-sm" />
          <select name="status" className="input w-full sm:w-40 text-sm">
            <option value="">Tous statuts</option>
            {Object.entries(STATUS_UI).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <input name="from" type="date" className="input w-full sm:w-36 text-sm" />
          <button type="submit" className="btn-primary text-sm px-5">Filtrer</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#ede7e0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#ede7e0] bg-[#FBF5F0]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Espace</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Total</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Acompte</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const ui = STATUS_UI[b.status] ?? { label: b.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={b.id} className={`hover:bg-[#FBF5F0]/50 ${i < bookings.length - 1 ? "border-b border-[#ede7e0]" : ""}`}>
                    <td className="px-5 py-4 font-mono text-xs text-[#1A1410]/50">{b.id}</td>
                    <td className="px-5 py-4 text-[#1A1410]">{b.user.email.split("@")[0]}</td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-[#1A1410]">{b.venue.name}</span>
                      <span className="text-[#1A1410]/50"> · {b.venue.city}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ui.color}`}>{ui.label}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#C4622D]">
                      {formatPrice(b.total_price, b.client_currency)}
                    </td>
                    <td className="px-5 py-4 text-[#1A1410]/60">
                      {formatPrice(b.deposit_amount, b.client_currency)}
                    </td>
                    <td className="px-5 py-4 text-[#1A1410]/60">
                      {new Date(b.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-xs text-[#C4622D] hover:underline">Détail</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
