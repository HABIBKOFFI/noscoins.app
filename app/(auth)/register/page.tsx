"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type") === "owner" ? "owner" : "client";

  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
    type: defaultType,
    country_code: "FR",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "Erreur lors de l'inscription");
        return;
      }

      if (form.type === "owner") router.push("/owner");
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
          Créer un compte
        </h1>
        <p className="text-sm text-[#1A1410]/60 mb-6">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-[#C4622D] font-medium hover:underline">
            Se connecter
          </Link>
        </p>

        {/* Type de compte */}
        <div className="flex gap-3 mb-6">
          {(["client", "owner"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, type: t })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                form.type === t
                  ? "border-[#C4622D] bg-[#C4622D] text-white"
                  : "border-[#ede7e0] text-[#1A1410] hover:border-[#C4622D]"
              }`}
            >
              {t === "client" ? "Je cherche un espace" : "Je loue un espace"}
            </button>
          ))}
        </div>

        {error && (
          <div className="badge badge-error w-full justify-center mb-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Email</label>
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
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="8 caractères minimum"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1410] mb-1.5">
              Téléphone <span className="text-[#1A1410]/40">(optionnel)</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
              placeholder="+33 6 00 00 00 00"
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1410] mb-1.5">Pays</label>
            <select
              value={form.country_code}
              onChange={(e) => setForm({ ...form, country_code: e.target.value })}
              className="input"
            >
              <option value="FR">🇫🇷 France</option>
              <option value="BE">🇧🇪 Belgique</option>
              <option value="CI">🇨🇮 Côte d'Ivoire</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Création du compte…" : "Créer mon compte"}
          </button>

          <p className="text-xs text-[#1A1410]/40 text-center leading-relaxed">
            En créant un compte, vous acceptez nos{" "}
            <Link href="/legal/terms" className="underline">CGU</Link> et notre{" "}
            <Link href="/legal/privacy" className="underline">politique de confidentialité</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 bg-white rounded-2xl border border-[#ede7e0] animate-pulse" />}>
      <RegisterForm />
    </Suspense>
  );
}
