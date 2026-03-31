export const dynamic = "force-dynamic";

const DEMO_PAYMENTS = [
  {
    id: "pay1",
    booking_id: "b1",
    amount: 500,
    currency: "EUR",
    commission_amount: 180,
    commission_currency: "EUR",
    method: "card",
    status: "succeeded",
    psp_reference: "pi_3Oa1234ABC",
    refund_amount: null,
    created_at: new Date("2026-03-20T14:32:00"),
    venue: "Loft Marais",
    client: "client@noscoins.com",
  },
  {
    id: "pay2",
    booking_id: "b2",
    amount: 115000,
    currency: "XOF",
    commission_amount: 42000,
    commission_currency: "XOF",
    method: "orange_money",
    status: "succeeded",
    psp_reference: "CP-20260322-001",
    refund_amount: null,
    created_at: new Date("2026-03-22T09:15:00"),
    venue: "Villa Cocody",
    client: "client2@noscoins.com",
  },
  {
    id: "pay3",
    booking_id: "b4",
    amount: 410,
    currency: "EUR",
    commission_amount: 144,
    commission_currency: "EUR",
    method: "card",
    status: "refunded",
    psp_reference: "pi_3Oa5678DEF",
    refund_amount: 360,
    created_at: new Date("2026-03-10T11:00:00"),
    venue: "Loft Marais",
    client: "client4@noscoins.com",
  },
  {
    id: "pay4",
    booking_id: "b5",
    amount: 94000,
    currency: "XOF",
    commission_amount: 33600,
    commission_currency: "XOF",
    method: "wave",
    status: "succeeded",
    psp_reference: "CP-20260201-002",
    refund_amount: null,
    created_at: new Date("2026-02-01T16:45:00"),
    venue: "Villa Cocody",
    client: "client5@noscoins.com",
  },
];

const METHOD_LABELS: Record<string, string> = {
  card: "Carte", apple_pay: "Apple Pay", google_pay: "Google Pay",
  sepa: "SEPA", orange_money: "Orange Money", mtn: "MTN MoMo",
  moov: "Moov", wave: "Wave",
};

const STATUS_UI: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  succeeded: { label: "Réussi",     color: "bg-green-100 text-green-700" },
  failed:    { label: "Échoué",     color: "bg-red-100 text-red-600" },
  refunded:  { label: "Remboursé",  color: "bg-purple-100 text-purple-700" },
};

function fmt(amount: number | null, currency: string | null) {
  if (!amount) return "—";
  if (currency === "XOF") return `${Number(amount).toLocaleString("fr-FR")} FCFA`;
  return `${Number(amount).toLocaleString("fr-FR")} €`;
}

export default function AdminPaymentsPage() {
  const totalRevEUR = DEMO_PAYMENTS
    .filter((p) => p.status === "succeeded" && p.currency === "EUR")
    .reduce((s, p) => s + p.commission_amount, 0);
  const totalRevXOF = DEMO_PAYMENTS
    .filter((p) => p.status === "succeeded" && p.currency === "XOF")
    .reduce((s, p) => s + p.commission_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1A1410] mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
        Paiements & Commissions
      </h1>

      {/* KPIs commissions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#C4622D] rounded-2xl p-5 text-white">
          <p className="text-sm text-white/70 mb-1">Commissions Europe</p>
          <p className="text-2xl font-bold">{fmt(totalRevEUR, "EUR")}</p>
          <p className="text-xs text-white/60 mt-1">Paiements réussis</p>
        </div>
        <div className="bg-[#E8A838] rounded-2xl p-5 text-white">
          <p className="text-sm text-white/70 mb-1">Commissions Côte d&apos;Ivoire</p>
          <p className="text-2xl font-bold">{fmt(totalRevXOF, "XOF")}</p>
          <p className="text-xs text-white/60 mt-1">Paiements réussis</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-5">
          <p className="text-sm text-[#1A1410]/60 mb-1">Remboursements</p>
          <p className="text-2xl font-bold text-purple-600">
            {fmt(DEMO_PAYMENTS.filter((p) => p.status === "refunded").reduce((s, p) => s + (p.refund_amount ?? 0), 0), "EUR")}
          </p>
          <p className="text-xs text-[#1A1410]/40 mt-1">{DEMO_PAYMENTS.filter((p) => p.status === "refunded").length} remboursement(s)</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-[#ede7e0] p-4 mb-6">
        <form className="flex flex-col sm:flex-row gap-3">
          <input name="q" placeholder="Référence PSP, email client…" className="input flex-1 text-sm" />
          <select name="status" className="input w-full sm:w-40 text-sm">
            <option value="">Tous statuts</option>
            {Object.entries(STATUS_UI).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select name="method" className="input w-full sm:w-40 text-sm">
            <option value="">Toutes méthodes</option>
            {Object.entries(METHOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary text-sm px-5">Filtrer</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#ede7e0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#ede7e0] bg-[#FBF5F0]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Référence PSP</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Client / Espace</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Méthode</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Montant</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Commission</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {DEMO_PAYMENTS.map((p, i) => {
                const ui = STATUS_UI[p.status] ?? { label: p.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={p.id} className={`hover:bg-[#FBF5F0]/50 ${i < DEMO_PAYMENTS.length - 1 ? "border-b border-[#ede7e0]" : ""}`}>
                    <td className="px-5 py-4 font-mono text-xs text-[#1A1410]/60">{p.psp_reference}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#1A1410]">{p.client.split("@")[0]}</p>
                      <p className="text-xs text-[#1A1410]/50">{p.venue}</p>
                    </td>
                    <td className="px-5 py-4 text-[#1A1410]/70">{METHOD_LABELS[p.method] ?? p.method}</td>
                    <td className="px-5 py-4 font-semibold text-[#1A1410]">{fmt(p.amount, p.currency)}</td>
                    <td className="px-5 py-4 font-semibold text-[#C4622D]">{fmt(p.commission_amount, p.commission_currency)}</td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ui.color}`}>{ui.label}</span>
                        {p.refund_amount && (
                          <p className="text-xs text-purple-600">Remb. {fmt(p.refund_amount, p.currency)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#1A1410]/60">
                      {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-4">
                      {p.status === "succeeded" && (
                        <button className="text-xs text-red-500 hover:underline">Rembourser</button>
                      )}
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
