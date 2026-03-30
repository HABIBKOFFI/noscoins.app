"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "Identifiants incorrects");
        return;
      }

      // Rediriger selon le rôle
      const role = data.user?.type;
      if (role === "admin") router.push("/admin");
      else if (role === "owner") router.push("/owner");
      else router.push("/client");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-[#ede7e0] p-8 shadow-sm">
        <h1
          className="text-2xl font-bold text-[#1A1410] mb-2"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Connexion
        </h1>
        <p className="text-sm text-[#1A1410]/60 mb-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-[#C4622D] font-medium hover:underline">
            S'inscrire
          </Link>
        </p>

        {error && (
          <div className="badge badge-error w-full justify-center mb-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1410] mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="vous@exemple.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1410] mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
