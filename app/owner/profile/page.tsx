"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";

export default function OwnerProfilePage() {
  const [form, setForm] = useState({
    name: "Marie Propriétaire",
    email: "owner.paris@noscoins.com",
    phone: "+33600000002",
    country_code: "FR",
    company_name: "Loft Marais Events SARL",
    siret: "12345678901234",
    iban: "FR76 3000 6000 0112 3456 7890 189",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#1A1410] mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
        Profil propriétaire
      </h1>
      <p className="text-sm text-[#1A1410]/50 mb-8">Gérez votre profil et vos coordonnées de paiement.</p>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Informations personnelles */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 space-y-4">
          <h2 className="font-semibold text-[#1A1410]">Informations personnelles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Nom complet</label>
              <input type="text" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Email</label>
              <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Téléphone</label>
              <input type="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Pays</label>
              <select className="input" value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value })}>
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CI">Côte d&apos;Ivoire</option>
                <option value="SN">Sénégal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informations société */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 space-y-4">
          <h2 className="font-semibold text-[#1A1410]">Informations société <span className="text-xs font-normal text-[#1A1410]/40">(optionnel)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Nom de la société</label>
              <input type="text" className="input" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Ma Société SARL" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">SIRET / N° enregistrement</label>
              <input type="text" className="input" value={form.siret} onChange={(e) => setForm({ ...form, siret: e.target.value })} placeholder="12345678901234" />
            </div>
          </div>
        </div>

        {/* Coordonnées bancaires */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1A1410]">Coordonnées bancaires</h2>
            <Link href="/owner/documents" className="text-xs text-[#C4622D] hover:underline">Soumettre mon RIB →</Link>
          </div>
          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">IBAN</label>
            <input
              type="text" className="input font-mono text-sm"
              value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })}
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
            />
            <p className="text-xs text-[#1A1410]/40 mt-1">Votre IBAN n&apos;est jamais affiché publiquement.</p>
          </div>

          {/* Stripe Connect status */}
          <div className="bg-[#FBF5F0] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1A1410]">Stripe Connect</p>
                <p className="text-xs text-[#1A1410]/50 mt-0.5">Pour recevoir des paiements depuis l&apos;Europe</p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Non connecté</span>
            </div>
            <button type="button" className="mt-3 text-sm text-[#C4622D] border border-[#C4622D]/30 rounded-xl px-4 py-2 hover:bg-[#C4622D]/5 transition-colors">
              Connecter mon compte Stripe
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">✓ Profil mis à jour</span>}
        </div>
      </form>

      {/* Mot de passe */}
      <div className="mt-6 bg-white rounded-2xl border border-[#ede7e0] p-6">
        <h2 className="font-semibold text-[#1A1410] mb-4">Mot de passe</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Mot de passe actuel</label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Nouveau</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Confirmer</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
          </div>
          <button type="button" className="btn-secondary text-sm">Changer le mot de passe</button>
        </div>
      </div>
    </div>
  );
}
