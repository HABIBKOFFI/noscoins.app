export const dynamic = "force-dynamic";

import Link from "next/link";

const WALLET = {
  balance: 2840,
  currency: "EUR",
  pending: 450,
};

const PAYOUTS = [
  { id: "p1", amount: 1080, currency: "EUR", status: "completed", payout_date: new Date("2026-03-15"), reference: "PO-2026-001" },
  { id: "p2", amount: 960, currency: "EUR", status: "completed", payout_date: new Date("2026-02-28"), reference: "PO-2026-002" },
  { id: "p3", amount: 450, currency: "EUR", status: "pending",   payout_date: null,                  reference: "PO-2026-003" },
];

const STATUS_UI: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",  color: "bg-yellow-100 text-yellow-700" },
  processing:{ label: "En cours",    color: "bg-blue-100 text-blue-700" },
  completed: { label: "Versé",       color: "bg-green-100 text-green-700" },
  failed:    { label: "Échoué",      color: "bg-red-100 text-red-600" },
};

function formatAmount(amount: number, currency: string) {
  if (currency === "XOF") return `${amount.toLocaleString("fr-FR")} FCFA`;
  return `${amount.toLocaleString("fr-FR")} €`;
}

export default function OwnerPayoutsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1A1410] mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
        Wallet & Virements
      </h1>
      <p className="text-sm text-[#1A1410]/50 mb-8">Consultez votre solde et l&apos;historique de vos versements.</p>

      {/* Wallet cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#C4622D] rounded-2xl p-6 text-white">
          <p className="text-sm text-white/70 mb-2">Solde disponible</p>
          <p className="text-3xl font-bold">{formatAmount(WALLET.balance, WALLET.currency)}</p>
          <p className="text-xs text-white/60 mt-3">Commission plateforme déjà déduite</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6">
          <p className="text-sm text-[#1A1410]/60 mb-2">En attente de validation</p>
          <p className="text-3xl font-bold text-[#E8A838]">{formatAmount(WALLET.pending, WALLET.currency)}</p>
          <p className="text-xs text-[#1A1410]/40 mt-3">Acomptes des réservations confirmées</p>
        </div>
      </div>

      {/* Request payout */}
      <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 mb-8">
        <h2 className="font-semibold text-[#1A1410] mb-1">Demander un virement</h2>
        <p className="text-sm text-[#1A1410]/55 mb-4">
          Les virements sont traités sous 2–3 jours ouvrés vers votre compte bancaire.
          Montant minimum : 50€.
        </p>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Montant (€)</label>
            <input
              type="number"
              defaultValue={WALLET.balance}
              max={WALLET.balance}
              min={50}
              className="input w-40"
              placeholder="50"
            />
          </div>
          <button
            className="btn-primary"
            disabled={WALLET.balance < 50}
          >
            Demander le virement
          </button>
        </div>
        {WALLET.balance < 50 && (
          <p className="text-xs text-red-500 mt-2">Solde insuffisant — minimum 50€ requis.</p>
        )}
        <p className="text-xs text-[#1A1410]/40 mt-3">
          Coordonnées bancaires non renseignées.{" "}
          <Link href="/owner/profile" className="text-[#C4622D] hover:underline">
            Ajouter mon RIB →
          </Link>
        </p>
      </div>

      {/* Historique */}
      <h2 className="font-semibold text-[#1A1410] mb-4">Historique des virements</h2>

      {PAYOUTS.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#ede7e0]">
          <p className="text-[#1A1410]/50">Aucun virement effectué pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#ede7e0] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#ede7e0]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Référence</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Montant</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#1A1410]/50 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {PAYOUTS.map((p, i) => {
                const ui = STATUS_UI[p.status] ?? { label: p.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={p.id} className={i < PAYOUTS.length - 1 ? "border-b border-[#ede7e0]" : ""}>
                    <td className="px-5 py-4 font-mono text-xs text-[#1A1410]/70">{p.reference}</td>
                    <td className="px-5 py-4 font-semibold text-[#C4622D]">{formatAmount(p.amount, p.currency)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ui.color}`}>{ui.label}</span>
                    </td>
                    <td className="px-5 py-4 text-[#1A1410]/60">
                      {p.payout_date
                        ? new Date(p.payout_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
