"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

type DocType = "identity" | "rib" | "business_registration" | "other";

interface DocStatus {
  type: DocType;
  label: string;
  description: string;
  required: boolean;
  status: "missing" | "pending" | "approved" | "rejected";
  file?: string;
  rejection_reason?: string;
}

const INITIAL_DOCS: DocStatus[] = [
  {
    type: "identity",
    label: "Pièce d'identité",
    description: "CNI, passeport ou titre de séjour en cours de validité (recto/verso).",
    required: true,
    status: "approved",
    file: "cni_dupont.pdf",
  },
  {
    type: "rib",
    label: "RIB / Coordonnées bancaires",
    description: "Relevé d'identité bancaire pour recevoir vos paiements.",
    required: true,
    status: "pending",
    file: "rib_loft_marais.pdf",
  },
  {
    type: "business_registration",
    label: "Extrait Kbis / Registre de commerce",
    description: "Si vous exercez en tant que professionnel ou société.",
    required: false,
    status: "missing",
  },
  {
    type: "other",
    label: "Autre document",
    description: "Tout document complémentaire demandé par notre équipe.",
    required: false,
    status: "rejected",
    file: "assurance_lieux.pdf",
    rejection_reason: "Document illisible. Merci de soumettre une version plus nette.",
  },
];

const STATUS_UI = {
  missing:  { label: "À soumettre",   color: "bg-gray-100 text-gray-500",     icon: "—" },
  pending:  { label: "En vérification", color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
  approved: { label: "Approuvé",      color: "bg-green-100 text-green-700",   icon: "✓" },
  rejected: { label: "Refusé",        color: "bg-red-100 text-red-600",       icon: "✗" },
};

export default function OwnerDocumentsPage() {
  const [docs, setDocs] = useState<DocStatus[]>(INITIAL_DOCS);
  const [uploading, setUploading] = useState<DocType | null>(null);

  const approvedCount = docs.filter((d) => d.status === "approved").length;
  const requiredCount = docs.filter((d) => d.required).length;
  const allRequired = docs.filter((d) => d.required).every((d) => d.status === "approved");

  async function handleUpload(type: DocType, file: File) {
    setUploading(type);
    await new Promise((r) => setTimeout(r, 1200));
    setDocs((prev) =>
      prev.map((d) =>
        d.type === type
          ? { ...d, status: "pending", file: file.name, rejection_reason: undefined }
          : d
      )
    );
    setUploading(null);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1A1410] mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
        Documents KYC
      </h1>
      <p className="text-sm text-[#1A1410]/50 mb-6">
        Vos espaces ne peuvent être publiés qu&apos;après validation de vos documents. Délai de traitement : 48h ouvrées.
      </p>

      {/* Progression */}
      <div className={`rounded-2xl p-5 mb-8 border ${allRequired ? "bg-green-50 border-green-200" : "bg-[#E8A838]/10 border-[#E8A838]/30"}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[#1A1410]">
            {allRequired ? "✓ Tous les documents requis sont approuvés" : "Documents obligatoires à compléter"}
          </p>
          <span className="text-sm font-semibold text-[#1A1410]">
            {docs.filter((d) => d.required && d.status === "approved").length}/{requiredCount}
          </span>
        </div>
        <div className="w-full bg-white/50 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${allRequired ? "bg-green-500" : "bg-[#C4622D]"}`}
            style={{ width: `${(docs.filter((d) => d.required && d.status === "approved").length / requiredCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {docs.map((doc) => {
          const ui = STATUS_UI[doc.status];
          return (
            <div key={doc.type} className="bg-white rounded-2xl border border-[#ede7e0] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1A1410]">{doc.label}</h3>
                    {doc.required && (
                      <span className="text-xs text-[#C4622D] bg-[#C4622D]/10 px-2 py-0.5 rounded-full">Obligatoire</span>
                    )}
                  </div>
                  <p className="text-sm text-[#1A1410]/55">{doc.description}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${ui.color}`}>
                  {ui.icon} {ui.label}
                </span>
              </div>

              {doc.file && (
                <div className="flex items-center gap-2 mb-3 bg-[#FBF5F0] rounded-xl px-3 py-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4622D" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  <span className="text-xs text-[#1A1410]/70 flex-1">{doc.file}</span>
                  <button className="text-xs text-[#C4622D] hover:underline">Télécharger</button>
                </div>
              )}

              {doc.status === "rejected" && doc.rejection_reason && (
                <div className="bg-red-50 rounded-xl px-3 py-2 mb-3">
                  <p className="text-xs text-red-600"><strong>Motif de refus :</strong> {doc.rejection_reason}</p>
                </div>
              )}

              {(doc.status === "missing" || doc.status === "rejected") && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={uploading === doc.type}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(doc.type, file);
                    }}
                  />
                  <span className={`inline-flex items-center gap-2 text-sm border rounded-xl px-4 py-2 transition-colors ${
                    uploading === doc.type
                      ? "border-[#ede7e0] text-[#1A1410]/40 cursor-not-allowed"
                      : "border-[#C4622D] text-[#C4622D] hover:bg-[#C4622D]/5"
                  }`}>
                    {uploading === doc.type ? "Envoi en cours…" : (doc.status === "rejected" ? "Soumettre à nouveau" : "Choisir un fichier")}
                  </span>
                </label>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#1A1410]/40 text-center mt-8">
        Vos documents sont transmis de façon sécurisée et traités par notre équipe dans le respect du RGPD.{" "}
        <a href="mailto:privacy@noscoins.app" className="text-[#C4622D]">privacy@noscoins.app</a>
      </p>
    </div>
  );
}
