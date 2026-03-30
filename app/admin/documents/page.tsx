"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Document {
  id: string;
  type: string;
  file_url: string;
  status: string;
  created_at: string;
  user: { id: string; email: string; phone: string | null; country_code: string | null };
}

const TYPE_LABELS: Record<string, string> = {
  identity: "Pièce d'identité", rib: "RIB", business_registration: "Kbis", other: "Autre",
};

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/documents?status=${filter}`)
      .then((r) => r.json())
      .then((d) => { setDocs(d.data ?? []); setLoading(false); });
  }, [filter]);

  async function review(documentId: string, action: "approve" | "reject") {
    await fetch("/api/admin/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, action, reason: rejectReason[documentId] }),
    });
    setDocs((ds) => ds.filter((d) => d.id !== documentId));
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Dashboard admin</Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Vérification KYC
        </h1>
      </div>

      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-sm py-1.5 px-4 rounded-full border transition-colors ${
              filter === s ? "border-[#C4622D] bg-[#C4622D] text-white" : "border-[#ede7e0] text-[#1A1410] hover:border-[#C4622D]"
            }`}
          >
            {s === "pending" ? "En attente" : s === "approved" ? "Approuvés" : "Refusés"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#1A1410]/40">Chargement…</div>
      ) : docs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-12 text-center">
          <p className="text-[#1A1410]/40">Aucun document avec ce statut.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-[#ede7e0] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#1A1410]">
                    {TYPE_LABELS[doc.type] ?? doc.type}
                  </p>
                  <p className="text-sm text-[#1A1410]/60">Propriétaire : {doc.user.email}</p>
                  {doc.user.country_code && (
                    <p className="text-xs text-[#1A1410]/40">{doc.user.country_code} · {doc.user.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#1A1410]/40">{new Date(doc.created_at).toLocaleDateString("fr-FR")}</p>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#C4622D] hover:underline"
                  >
                    Voir le document ↗
                  </a>
                </div>
              </div>

              {filter === "pending" && (
                <div className="mt-4 pt-4 border-t border-[#ede7e0] space-y-3">
                  <input
                    type="text"
                    placeholder="Motif de refus (optionnel)"
                    value={rejectReason[doc.id] ?? ""}
                    onChange={(e) => setRejectReason((r) => ({ ...r, [doc.id]: e.target.value }))}
                    className="input text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => review(doc.id, "approve")} className="btn-primary text-sm py-2 px-4">
                      ✓ Approuver
                    </button>
                    <button onClick={() => review(doc.id, "reject")} className="btn-ghost text-sm py-2 px-4 text-red-500 border-red-200">
                      ✕ Refuser
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
