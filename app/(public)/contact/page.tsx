"use client";
export const dynamic = "force-static";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulation — à brancher sur /api/contact ou Resend directement
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
      <h1 className="text-3xl font-bold text-[#1A1410] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        Nous contacter
      </h1>
      <p className="text-sm text-[#1A1410]/50 mb-10">Notre équipe répond sous 24h ouvrées.</p>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="font-semibold text-[#1A1410] mb-1">Message envoyé !</h2>
          <p className="text-sm text-[#1A1410]/50">Nous vous répondrons à <strong>{form.email}</strong> sous 24h.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#ede7e0] p-8 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Nom</label>
              <input
                type="text" required className="input"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Email</label>
              <input
                type="email" required className="input"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Sujet</label>
            <select
              className="input" required
              value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              <option value="">Choisir un sujet</option>
              <option value="reservation">Problème de réservation</option>
              <option value="payment">Question sur un paiement</option>
              <option value="owner">Je suis propriétaire</option>
              <option value="kyc">Vérification d&apos;identité</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Message</label>
            <textarea
              required rows={5} className="input resize-none"
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Décrivez votre demande en détail..."
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Envoi en cours…" : "Envoyer le message"}
          </button>

          <p className="text-xs text-[#1A1410]/30 text-center">
            Ou directement par email : <a href="mailto:support@noscoins.app" className="text-[#C4622D]">support@noscoins.app</a>
          </p>
        </form>
      )}

      {/* Infos complémentaires */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Support général", value: "support@noscoins.app" },
          { label: "Propriétaires", value: "owners@noscoins.app" },
          { label: "Presse & partenariats", value: "press@noscoins.app" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-[#ede7e0] p-4">
            <p className="text-xs text-[#1A1410]/40 mb-1">{label}</p>
            <a href={`mailto:${value}`} className="text-sm text-[#C4622D] font-medium">{value}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
