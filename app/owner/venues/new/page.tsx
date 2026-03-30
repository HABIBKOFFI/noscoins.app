"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["Salle de réception", "Loft", "Rooftop", "Villa", "Château", "Studio", "Espace atypique", "Autre"];

export default function NewVenuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    capacity_seat: "",
    capacity_stand: "",
    base_price: "",
    currency: "EUR",
    booking_mode: "instant",
    balance_due_days_before: "30",
    is_off_market: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/owner/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined,
          capacity_seat: form.capacity_seat ? parseInt(form.capacity_seat) : undefined,
          capacity_stand: form.capacity_stand ? parseInt(form.capacity_stand) : undefined,
          base_price: parseFloat(form.base_price),
          balance_due_days_before: parseInt(form.balance_due_days_before),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? "Erreur lors de la création");
        return;
      }

      router.push(`/owner/venues/${data.data.id}/edit`);
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/owner" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">
          ← Retour au dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Créer un espace
        </h1>
      </div>

      {error && (
        <div className="badge badge-error w-full justify-center mb-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 space-y-4">
          <h2 className="font-semibold text-[#1A1410]">Informations générales</h2>

          <div>
            <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Nom de l&apos;espace *</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input" placeholder="Loft Marais, Villa Cocody…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Ville *</label>
              <input
                type="text" required value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input" placeholder="Paris, Abidjan…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Devise *</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="input"
              >
                <option value="EUR">🇪🇺 EUR (€)</option>
                <option value="XOF">🇨🇮 XOF (FCFA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Adresse</label>
            <input
              type="text" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input" placeholder="12 rue de Bretagne, 75003 Paris"
            />
          </div>
        </div>

        {/* Capacité & tarif */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 space-y-4">
          <h2 className="font-semibold text-[#1A1410]">Capacité & tarif</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Capacité assise</label>
              <input
                type="number" min="1" value={form.capacity_seat}
                onChange={(e) => setForm({ ...form, capacity_seat: e.target.value })}
                className="input" placeholder="80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Capacité debout</label>
              <input
                type="number" min="1" value={form.capacity_stand}
                onChange={(e) => setForm({ ...form, capacity_stand: e.target.value })}
                className="input" placeholder="120"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">
                Prix de base * ({form.currency === "XOF" ? "FCFA" : "€"})
              </label>
              <input
                type="number" required min="0" step="any" value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                className="input" placeholder={form.currency === "XOF" ? "350000" : "1200"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Solde dû (jours avant)</label>
              <input
                type="number" min="1" value={form.balance_due_days_before}
                onChange={(e) => setForm({ ...form, balance_due_days_before: e.target.value })}
                className="input" placeholder="30"
              />
            </div>
          </div>
        </div>

        {/* Paramètres de réservation */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 space-y-4">
          <h2 className="font-semibold text-[#1A1410]">Paramètres de réservation</h2>

          <div>
            <label className="block text-sm font-medium text-[#1A1410] mb-2">Mode de réservation</label>
            <div className="flex gap-3">
              {(["instant", "request"] as const).map((mode) => (
                <button
                  key={mode} type="button"
                  onClick={() => setForm({ ...form, booking_mode: mode })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    form.booking_mode === mode
                      ? "border-[#C4622D] bg-[#C4622D] text-white"
                      : "border-[#ede7e0] text-[#1A1410] hover:border-[#C4622D]"
                  }`}
                >
                  {mode === "instant" ? "⚡ Réservation instantanée" : "📋 Sur demande"}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#1A1410]/40 mt-2">
              {form.booking_mode === "instant"
                ? "Le client confirme directement après paiement."
                : "Vous acceptez ou refusez chaque demande sous 48h."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="off_market" checked={form.is_off_market}
              onChange={(e) => setForm({ ...form, is_off_market: e.target.checked })}
              className="w-4 h-4 accent-[#C4622D]"
            />
            <label htmlFor="off_market" className="text-sm text-[#1A1410]">
              Espace off-market (accessible uniquement via lien secret)
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/owner" className="btn-secondary flex-1 text-center">
            Annuler
          </Link>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "Création…" : "Créer l'espace"}
          </button>
        </div>
      </form>
    </div>
  );
}
