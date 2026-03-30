"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  price: string | number;
  type: "mandatory" | "optional";
  category: string | null;
}

interface Venue {
  id: string;
  name: string;
  city: string;
  address: string | null;
  capacity_seat: number | null;
  capacity_stand: number | null;
  base_price: string | number | null;
  currency: string;
  booking_mode: string;
  balance_due_days_before: number;
  is_off_market: boolean;
  secret_link: string | null;
  status: string;
  services: Service[];
}

export default function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "", city: "", address: "", capacity_seat: "", capacity_stand: "",
    base_price: "", booking_mode: "instant", balance_due_days_before: "30", is_off_market: false,
  });

  const [newService, setNewService] = useState({ name: "", price: "", type: "optional", category: "" });

  useEffect(() => {
    fetch(`/api/owner/venues/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const v = d.data;
        setVenue(v);
        setForm({
          name: v.name, city: v.city ?? "", address: v.address ?? "",
          capacity_seat: v.capacity_seat?.toString() ?? "",
          capacity_stand: v.capacity_stand?.toString() ?? "",
          base_price: v.base_price?.toString() ?? "",
          booking_mode: v.booking_mode,
          balance_due_days_before: v.balance_due_days_before?.toString() ?? "30",
          is_off_market: v.is_off_market,
        });
      });
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/owner/venues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity_seat: form.capacity_seat ? parseInt(form.capacity_seat) : undefined,
          capacity_stand: form.capacity_stand ? parseInt(form.capacity_stand) : undefined,
          base_price: parseFloat(form.base_price),
          balance_due_days_before: parseInt(form.balance_due_days_before),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message ?? "Erreur"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  async function addService() {
    if (!newService.name || !newService.price) return;
    await fetch(`/api/owner/venues/${id}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newService, price: parseFloat(newService.price) }),
    });
    const res = await fetch(`/api/owner/venues/${id}`);
    const data = await res.json();
    setVenue(data.data);
    setNewService({ name: "", price: "", type: "optional", category: "" });
  }

  async function deleteService(serviceId: string) {
    await fetch(`/api/owner/venues/${id}/services`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId }),
    });
    setVenue((v) => v ? { ...v, services: v.services.filter((s) => s.id !== serviceId) } : v);
  }

  if (!venue) return <div className="flex items-center justify-center h-64"><div className="text-[#1A1410]/40">Chargement…</div></div>;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://noscoins.app";

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/owner" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Dashboard</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
            Modifier l&apos;espace
          </h1>
          <span className={`badge text-xs ${
            venue.status === "published" ? "badge-success" :
            venue.status === "validated" ? "badge-or" :
            venue.status === "suspended" ? "badge-error" : "badge-warning"
          }`}>
            {venue.status === "published" ? "Publié" : venue.status === "validated" ? "Validé" : venue.status === "suspended" ? "Suspendu" : "En attente"}
          </span>
        </div>
      </div>

      {error && <div className="badge badge-error w-full justify-center mb-4 py-3 rounded-xl text-sm">{error}</div>}
      {saved && <div className="badge badge-success w-full justify-center mb-4 py-3 rounded-xl text-sm">Modifications enregistrées ✓</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 space-y-4">
          <h2 className="font-semibold text-[#1A1410]">Informations générales</h2>
          <div>
            <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Nom *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Ville *</label>
              <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Adresse</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Prix de base</label>
              <input type="number" step="any" min="0" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Cap. assise</label>
              <input type="number" min="0" value={form.capacity_seat} onChange={(e) => setForm({ ...form, capacity_seat: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Cap. debout</label>
              <input type="number" min="0" value={form.capacity_stand} onChange={(e) => setForm({ ...form, capacity_stand: e.target.value })} className="input" />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl border border-[#ede7e0] p-6 space-y-4">
          <h2 className="font-semibold text-[#1A1410]">Services</h2>
          {venue.services.length === 0 && (
            <p className="text-sm text-[#1A1410]/40">Aucun service ajouté.</p>
          )}
          {venue.services.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#ede7e0] last:border-0">
              <div>
                <span className="text-sm font-medium text-[#1A1410]">{s.name}</span>
                <span className={`ml-2 badge text-xs ${s.type === "mandatory" ? "badge-warning" : "badge-default"}`}>
                  {s.type === "mandatory" ? "Inclus" : "Optionnel"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#C4622D] font-medium">{Number(s.price).toLocaleString("fr-FR")} {venue.currency === "XOF" ? "FCFA" : "€"}</span>
                <button type="button" onClick={() => deleteService(s.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-4 gap-2 pt-2">
            <input type="text" placeholder="Nom du service" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} className="input col-span-2 text-sm" />
            <input type="number" placeholder="Prix" step="any" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} className="input text-sm" />
            <select value={newService.type} onChange={(e) => setNewService({ ...newService, type: e.target.value })} className="input text-sm">
              <option value="optional">Optionnel</option>
              <option value="mandatory">Inclus</option>
            </select>
          </div>
          <button type="button" onClick={addService} className="btn-secondary text-sm py-2 px-4">+ Ajouter</button>
        </div>

        {/* Off-market */}
        {venue.is_off_market && venue.secret_link && (
          <div className="bg-[#FBF5F0] rounded-2xl border border-[#ede7e0] p-4">
            <p className="text-sm font-medium text-[#1A1410] mb-1">Lien secret (off-market)</p>
            <p className="text-xs text-[#C4622D] font-mono break-all">{appUrl}/venues/{id}?secret={venue.secret_link}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/owner" className="btn-secondary flex-1 text-center">Annuler</Link>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
