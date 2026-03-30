"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Quote {
  id: string;
  status: string;
  requested_date: string | null;
  proposed_price: string | number | null;
  message: string | null;
  expires_at: string | null;
  created_at: string;
  venue: { id: string; name: string; currency: string };
  client: { email: string };
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  countered: "Contre-offre envoyée",
  accepted: "Accepté",
  refused: "Refusé",
  expired: "Expiré",
};
const STATUS_CLASSES: Record<string, string> = {
  pending: "badge-warning",
  countered: "badge-or",
  accepted: "badge-success",
  refused: "badge-error",
  expired: "badge-default",
};

export default function OwnerQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [response, setResponse] = useState({ action: "accept", counter_price: "", message: "" });

  useEffect(() => {
    fetch("/api/quotes?role=owner")
      .then((r) => r.json())
      .then((d) => { setQuotes(d.data ?? []); setLoading(false); });
  }, []);

  async function respond(quoteId: string) {
    const body: Record<string, unknown> = { action: response.action, message: response.message };
    if (response.action === "counter" && response.counter_price) {
      body.proposed_price = parseFloat(response.counter_price);
    }
    await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setQuotes((qs) => qs.map((q) => q.id === quoteId ? { ...q, status: response.action === "accept" ? "accepted" : response.action === "refuse" ? "refused" : "countered" } : q));
    setActiveId(null);
  }

  function formatDate(s: string | null) {
    if (!s) return "–";
    return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-[#1A1410]/40">Chargement…</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/owner" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Demandes de devis
        </h1>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-12 text-center">
          <p className="text-[#1A1410]/40">Aucune demande de devis pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl border border-[#ede7e0] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#1A1410]">{q.venue.name}</span>
                    <span className={`badge text-xs ${STATUS_CLASSES[q.status] ?? "badge-default"}`}>
                      {STATUS_LABELS[q.status] ?? q.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#1A1410]/60">De : {q.client.email}</p>
                  {q.requested_date && (
                    <p className="text-sm text-[#1A1410]/60">Date souhaitée : {formatDate(q.requested_date)}</p>
                  )}
                  {q.proposed_price && (
                    <p className="text-sm text-[#C4622D] font-medium">
                      Budget proposé : {Number(q.proposed_price).toLocaleString("fr-FR")} {q.venue.currency === "XOF" ? "FCFA" : "€"}
                    </p>
                  )}
                  {q.message && <p className="text-sm text-[#1A1410]/70 mt-2 italic">&ldquo;{q.message}&rdquo;</p>}
                  {q.expires_at && q.status === "pending" && (
                    <p className="text-xs text-orange-500 mt-1">Expire le {formatDate(q.expires_at)}</p>
                  )}
                </div>
                <div className="text-xs text-[#1A1410]/40 whitespace-nowrap">{formatDate(q.created_at)}</div>
              </div>

              {q.status === "pending" && (
                <div className="mt-4 pt-4 border-t border-[#ede7e0]">
                  {activeId === q.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {(["accept", "refuse", "counter"] as const).map((a) => (
                          <button
                            key={a} type="button"
                            onClick={() => setResponse((r) => ({ ...r, action: a }))}
                            className={`text-sm py-1.5 px-3 rounded-lg border transition-colors ${
                              response.action === a ? "border-[#C4622D] bg-[#C4622D] text-white" : "border-[#ede7e0] text-[#1A1410] hover:border-[#C4622D]"
                            }`}
                          >
                            {a === "accept" ? "Accepter" : a === "refuse" ? "Refuser" : "Contre-offre"}
                          </button>
                        ))}
                      </div>
                      {response.action === "counter" && (
                        <input
                          type="number" placeholder="Prix proposé" value={response.counter_price}
                          onChange={(e) => setResponse((r) => ({ ...r, counter_price: e.target.value }))}
                          className="input text-sm"
                        />
                      )}
                      <textarea
                        placeholder="Message (optionnel)" value={response.message}
                        onChange={(e) => setResponse((r) => ({ ...r, message: e.target.value }))}
                        className="input text-sm h-20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setActiveId(null)} className="btn-ghost text-sm py-2 px-4">Annuler</button>
                        <button onClick={() => respond(q.id)} className="btn-primary text-sm py-2 px-4">Envoyer</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setActiveId(q.id)} className="btn-secondary text-sm py-2 px-4">
                      Répondre
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
