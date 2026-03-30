"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Config {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

const CONFIG_LABELS: Record<string, string> = {
  commission_rate_eu: "Commission Europe (%)",
  commission_rate_ci: "Commission Côte d'Ivoire (%)",
  booking_lock_minutes: "Durée du lock (minutes)",
  service_fee_eur: "Frais de service EU (€)",
  service_fee_xof: "Frais de service CI (FCFA)",
  owner_cancellation_penalty_rate: "Pénalité annulation propriétaire (%)",
  quote_expiry_hours: "Expiration devis (heures)",
  request_booking_expiry_hours: "Expiration mode request (heures)",
  premium_price_eur: "Prix Premium EU (€/mois)",
  premium_price_xof: "Prix Premium CI (FCFA/mois)",
  premium_trial_days: "Jours d'essai Premium",
};

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => { setConfigs(d.data ?? []); setLoading(false); });
  }, []);

  async function save(key: string) {
    const value = editing[key];
    if (value === undefined) return;
    await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setConfigs((cs) => cs.map((c) => c.key === key ? { ...c, value } : c));
    setSaved((s) => ({ ...s, [key]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000);
    setEditing((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Dashboard admin</Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Configuration
        </h1>
        <p className="text-sm text-[#1A1410]/50 mt-1">Paramètres globaux de la plateforme. Toute modification est auditée.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#1A1410]/40">Chargement…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#ede7e0] divide-y divide-[#ede7e0]">
          {configs.map((c) => (
            <div key={c.key} className="p-5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A1410]">
                  {CONFIG_LABELS[c.key] ?? c.key}
                </p>
                <p className="text-xs text-[#1A1410]/40 font-mono mt-0.5">{c.key}</p>
                <p className="text-xs text-[#1A1410]/40 mt-0.5">
                  Modifié le {new Date(c.updated_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editing[c.key] ?? c.value}
                  onChange={(e) => setEditing((ed) => ({ ...ed, [c.key]: e.target.value }))}
                  className="input text-sm w-32 text-center"
                />
                {editing[c.key] !== undefined && editing[c.key] !== c.value ? (
                  <button onClick={() => save(c.key)} className="btn-primary text-sm py-2 px-3">
                    Sauvegarder
                  </button>
                ) : saved[c.key] ? (
                  <span className="text-xs text-green-600 font-medium w-24 text-center">✓ Enregistré</span>
                ) : (
                  <span className="w-24" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
