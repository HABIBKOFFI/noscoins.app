"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  type: string;
  email: string | null;
  phone: string | null;
  country_code: string | null;
  account_status: string;
  suspended_until: string | null;
  created_at: string;
  _count: { bookings: number; venues: number };
}

const TYPE_LABELS: Record<string, string> = { client: "Client", owner: "Propriétaire", admin: "Admin" };
const STATUS_CLASSES: Record<string, string> = {
  active: "badge-success", suspended: "badge-warning", blacklisted: "badge-error",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [action, setAction] = useState({ type: "suspend", reason: "", until: "" });

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (search) params.set("q", search);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.data ?? []); setLoading(false); });
  }

  useEffect(() => { load(); }, [typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function applyAction(userId: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: action.type, reason: action.reason, until: action.until || undefined }),
    });
    setActiveId(null);
    load();
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-[#1A1410]/50 hover:text-[#C4622D]">← Dashboard admin</Link>
        <h1 className="text-2xl font-bold text-[#1A1410] mt-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Gestion des utilisateurs
        </h1>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text" placeholder="Rechercher par email…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="input flex-1 text-sm"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-40 text-sm">
          <option value="">Tous les types</option>
          <option value="client">Clients</option>
          <option value="owner">Propriétaires</option>
          <option value="admin">Admins</option>
        </select>
        <button onClick={load} className="btn-primary text-sm py-2 px-4">Rechercher</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#1A1410]/40">Chargement…</div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl border border-[#ede7e0] p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-[#1A1410] truncate">{u.email}</span>
                    <span className="badge badge-default text-xs">{TYPE_LABELS[u.type] ?? u.type}</span>
                    <span className={`badge text-xs ${STATUS_CLASSES[u.account_status] ?? "badge-default"}`}>
                      {u.account_status === "active" ? "Actif" : u.account_status === "suspended" ? "Suspendu" : "Blacklisté"}
                    </span>
                  </div>
                  <p className="text-xs text-[#1A1410]/50">
                    {u.country_code} · {u.phone} · {new Date(u.created_at).toLocaleDateString("fr-FR")} ·{" "}
                    {u._count.bookings} rés. · {u._count.venues} espaces
                  </p>
                </div>
                {u.type !== "admin" && (
                  <button
                    onClick={() => setActiveId(activeId === u.id ? null : u.id)}
                    className="btn-ghost text-sm py-1.5 px-3"
                  >
                    Actions
                  </button>
                )}
              </div>

              {activeId === u.id && (
                <div className="mt-4 pt-4 border-t border-[#ede7e0] space-y-3">
                  <div className="flex gap-2">
                    {(["suspend", "blacklist", "reactivate"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setAction((prev) => ({ ...prev, type: a }))}
                        className={`text-sm py-1.5 px-3 rounded-lg border transition-colors ${
                          action.type === a ? "border-[#C4622D] bg-[#C4622D] text-white" : "border-[#ede7e0] text-[#1A1410]"
                        }`}
                      >
                        {a === "suspend" ? "Suspendre" : a === "blacklist" ? "Blacklister" : "Réactiver"}
                      </button>
                    ))}
                  </div>
                  {action.type !== "reactivate" && (
                    <input
                      type="text" placeholder="Motif (requis)"
                      value={action.reason}
                      onChange={(e) => setAction((a) => ({ ...a, reason: e.target.value }))}
                      className="input text-sm"
                    />
                  )}
                  {action.type === "suspend" && (
                    <input
                      type="date" placeholder="Jusqu'au"
                      value={action.until}
                      onChange={(e) => setAction((a) => ({ ...a, until: e.target.value }))}
                      className="input text-sm"
                    />
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setActiveId(null)} className="btn-ghost text-sm py-2 px-4">Annuler</button>
                    <button onClick={() => applyAction(u.id)} className="btn-primary text-sm py-2 px-4">Confirmer</button>
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
