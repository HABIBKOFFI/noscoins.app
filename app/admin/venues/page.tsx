"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Venue {
  id: string;
  name: string;
  city: string | null;
  status: string;
  base_price: string | number | null;
  currency: string | null;
  created_at: string;
  owner: { id: string; email: string; phone: string | null; country_code: string | null };
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", validated: "Validé", published: "Publié", suspended: "Suspendu",
};
const STATUS_CLASSES: Record<string, string> = {
  pending: "badge-warning", validated: "badge-or", published: "badge-success", suspended: "badge-error",
};

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/venues?status=${filter}`)
      .then((r) => r.json())
      .then((d) => { setVenues(d.data ?? []); setLoading(false); });
  }, [filter]);

  async function updateStatus(venueId: string, action: string) {
    await fetch("/api/admin/venues", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId, action }),
    });
    setVenues((vs) => vs.filter((v) => v.id !== venueId));
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Dashboard admin</Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Validation des espaces
        </h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["pending", "validated", "published", "suspended"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-sm py-1.5 px-4 rounded-full border transition-colors ${
              filter === s ? "border-[#C4622D] bg-[#C4622D] text-white" : "border-[#ede7e0] text-[#1A1410] hover:border-[#C4622D]"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#1A1410]/40">Chargement…</div>
      ) : venues.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-12 text-center">
          <p className="text-[#1A1410]/40">Aucun espace avec ce statut.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-[#ede7e0] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#1A1410]">{v.name}</span>
                    <span className={`badge text-xs ${STATUS_CLASSES[v.status] ?? "badge-default"}`}>
                      {STATUS_LABELS[v.status]}
                    </span>
                  </div>
                  <p className="text-sm text-[#1A1410]/60">{v.city}</p>
                  <p className="text-sm text-[#1A1410]/60">
                    Propriétaire : {v.owner.email}
                    {v.owner.country_code && ` · ${v.owner.country_code}`}
                  </p>
                  {v.base_price && (
                    <p className="text-sm text-[#C4622D] font-medium">
                      {Number(v.base_price).toLocaleString("fr-FR")} {v.currency === "XOF" ? "FCFA" : "€"}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className="text-xs text-[#1A1410]/40">{new Date(v.created_at).toLocaleDateString("fr-FR")}</span>
                  <Link href={`/venues/${v.id}`} target="_blank" className="text-xs text-[#C4622D] hover:underline">
                    Voir la fiche ↗
                  </Link>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-[#ede7e0]">
                {v.status === "pending" && (
                  <>
                    <button onClick={() => updateStatus(v.id, "validate")} className="btn-primary text-sm py-2 px-4">
                      ✓ Valider
                    </button>
                    <button onClick={() => updateStatus(v.id, "suspend")} className="btn-ghost text-sm py-2 px-4 text-red-500 border-red-200">
                      ✕ Suspendre
                    </button>
                  </>
                )}
                {v.status === "validated" && (
                  <button onClick={() => updateStatus(v.id, "publish")} className="btn-primary text-sm py-2 px-4">
                    Publier
                  </button>
                )}
                {v.status === "published" && (
                  <button onClick={() => updateStatus(v.id, "suspend")} className="btn-ghost text-sm py-2 px-4 text-red-500 border-red-200">
                    Suspendre
                  </button>
                )}
                {v.status === "suspended" && (
                  <button onClick={() => updateStatus(v.id, "publish")} className="btn-secondary text-sm py-2 px-4">
                    Réactiver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
