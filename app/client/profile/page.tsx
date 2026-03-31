"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

export default function ClientProfilePage() {
  const [form, setForm] = useState({
    name: "Jean Dupont",
    email: "client@noscoins.com",
    phone: "+33600000003",
    country_code: "FR",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

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
        Mon profil
      </h1>
      <p className="text-sm text-[#1A1410]/50 mb-8">Gérez vos informations personnelles.</p>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#ede7e0] p-6 space-y-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Nom complet</label>
            <input
              type="text" className="input" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Email</label>
            <input
              type="email" className="input" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Téléphone</label>
            <input
              type="tel" className="input"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+33600000000"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Pays</label>
            <select
              className="input"
              value={form.country_code}
              onChange={(e) => setForm({ ...form, country_code: e.target.value })}
            >
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CI">Côte d&apos;Ivoire</option>
              <option value="SN">Sénégal</option>
              <option value="CM">Cameroun</option>
              <option value="MA">Maroc</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">✓ Modifications enregistrées</span>
          )}
        </div>
      </form>

      {/* Changer le mot de passe */}
      <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 mb-6">
        <h2 className="font-semibold text-[#1A1410] mb-4">Mot de passe</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Mot de passe actuel</label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Nouveau mot de passe</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#1A1410]/60 uppercase tracking-wide block mb-1.5">Confirmer</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
          </div>
          <button className="btn-secondary text-sm">Changer le mot de passe</button>
        </div>
      </div>

      {/* Zone danger */}
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h2 className="font-semibold text-red-600 mb-2">Zone de danger</h2>
        <p className="text-sm text-[#1A1410]/60 mb-4">
          La suppression de votre compte est définitive. Toutes vos réservations et données seront anonymisées conformément au RGPD.
        </p>
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="text-sm text-red-500 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition-colors"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="bg-red-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-red-700">Êtes-vous sûr de vouloir supprimer votre compte ?</p>
            <div className="flex gap-3">
              <button className="text-sm bg-red-600 text-white rounded-xl px-4 py-2 hover:bg-red-700 transition-colors">
                Oui, supprimer définitivement
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="text-sm text-[#1A1410]/60 border border-[#ede7e0] rounded-xl px-4 py-2 hover:bg-[#FBF5F0] transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
