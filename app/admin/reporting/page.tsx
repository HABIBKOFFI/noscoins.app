export const dynamic = "force-dynamic";

const STATS = {
  total_revenue_eur: 3240,
  total_revenue_xof: 209000,
  total_bookings: 48,
  completed_bookings: 35,
  cancelled_bookings: 8,
  total_venues: 12,
  published_venues: 8,
  total_users: 127,
  conversion_rate: 0.22,
  avg_occupancy: 0.64,
};

const TOP_VENUES = [
  { name: "Loft Marais", city: "Paris", bookings: 12, revenue: 14400, currency: "EUR", avg_score: 4.7 },
  { name: "Villa Cocody", city: "Abidjan", bookings: 9, revenue: 3150000, currency: "XOF", avg_score: 4.5 },
  { name: "Rooftop Bastille", city: "Paris", bookings: 7, revenue: 5600, currency: "EUR", avg_score: 4.3 },
  { name: "Studio Belleville", city: "Paris", bookings: 5, revenue: 3500, currency: "EUR", avg_score: 4.6 },
  { name: "Domaine Abidjan Nord", city: "Abidjan", bookings: 4, revenue: 1400000, currency: "XOF", avg_score: 4.2 },
];

const MONTHLY = [
  { month: "Oct", bookings: 3, revenue: 360 },
  { month: "Nov", bookings: 5, revenue: 600 },
  { month: "Déc", bookings: 8, revenue: 960 },
  { month: "Jan", bookings: 9, revenue: 1080 },
  { month: "Fév", bookings: 11, revenue: 1320 },
  { month: "Mar", bookings: 12, revenue: 1440 },
];

const maxRevenue = Math.max(...MONTHLY.map((m) => m.revenue));

function fmt(n: number, currency?: string) {
  if (currency === "XOF") return `${n.toLocaleString("fr-FR")} FCFA`;
  if (currency === "EUR") return `${n.toLocaleString("fr-FR")} €`;
  return n.toLocaleString("fr-FR");
}

export default function AdminReportingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
          Reporting & Analytics
        </h1>
        <div className="flex gap-2">
          {["7j", "30j", "90j", "Tout"].map((p, i) => (
            <button key={p} className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${i === 1 ? "bg-[#C4622D] text-white border-[#C4622D]" : "border-[#ede7e0] text-[#1A1410]/60 hover:border-[#C4622D]/30"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenus EUR (commissions)", value: fmt(STATS.total_revenue_eur * 0.12, "EUR"), sub: "12% de commission", color: "text-[#C4622D]" },
          { label: "Revenus XOF (commissions)", value: fmt(STATS.total_revenue_xof * 0.12, "XOF"), sub: "12% de commission", color: "text-[#E8A838]" },
          { label: "Taux de conversion", value: `${(STATS.conversion_rate * 100).toFixed(0)}%`, sub: "Devis → Réservation", color: "text-blue-600" },
          { label: "Taux d'occupation moyen", value: `${(STATS.avg_occupancy * 100).toFixed(0)}%`, sub: "Espaces publiés", color: "text-green-600" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#ede7e0] p-5">
            <p className="text-xs text-[#1A1410]/50 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[#1A1410]/40 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {[
          { label: "Réservations", value: STATS.total_bookings },
          { label: "Terminées", value: STATS.completed_bookings },
          { label: "Annulées", value: STATS.cancelled_bookings },
          { label: "Espaces publiés", value: STATS.published_venues },
          { label: "Total espaces", value: STATS.total_venues },
          { label: "Utilisateurs", value: STATS.total_users },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-[#ede7e0] p-3 text-center">
            <p className="text-xl font-bold text-[#1A1410]">{value}</p>
            <p className="text-xs text-[#1A1410]/50 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique réservations par mois */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6">
          <h2 className="font-semibold text-[#1A1410] mb-6">Réservations par mois (EUR)</h2>
          <div className="flex items-end gap-3 h-40">
            {MONTHLY.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-[#1A1410]/50">{m.revenue}€</span>
                <div
                  className="w-full rounded-t-lg bg-[#C4622D] transition-all"
                  style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: "8px" }}
                />
                <span className="text-xs text-[#1A1410]/60">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel conversion */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6">
          <h2 className="font-semibold text-[#1A1410] mb-6">Funnel de conversion</h2>
          <div className="space-y-3">
            {[
              { label: "Vues espaces", value: 1240, pct: 100 },
              { label: "Demandes de devis", value: 218, pct: 18 },
              { label: "Devis acceptés", value: 76, pct: 35 },
              { label: "Réservations payées", value: 48, pct: 63 },
              { label: "Réservations complétées", value: 35, pct: 73 },
            ].map(({ label, value, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#1A1410]/70">{label}</span>
                  <span className="font-semibold text-[#1A1410]">{value.toLocaleString("fr-FR")}</span>
                </div>
                <div className="w-full bg-[#FBF5F0] rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#C4622D] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top espaces */}
      <div className="bg-white rounded-2xl border border-[#ede7e0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ede7e0]">
          <h2 className="font-semibold text-[#1A1410]">Top espaces</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#FBF5F0]">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">#</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Espace</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Réservations</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Revenus bruts</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Note moy.</th>
            </tr>
          </thead>
          <tbody>
            {TOP_VENUES.map((v, i) => (
              <tr key={v.name} className={i < TOP_VENUES.length - 1 ? "border-b border-[#ede7e0]" : ""}>
                <td className="px-5 py-4 text-[#1A1410]/40 font-medium">{i + 1}</td>
                <td className="px-5 py-4">
                  <span className="font-medium text-[#1A1410]">{v.name}</span>
                  <span className="text-[#1A1410]/50"> · {v.city}</span>
                </td>
                <td className="px-5 py-4 text-[#1A1410]">{v.bookings}</td>
                <td className="px-5 py-4 font-semibold text-[#C4622D]">{fmt(v.revenue, v.currency)}</td>
                <td className="px-5 py-4">
                  <span className="text-[#C4622D] font-semibold">★ {v.avg_score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
