import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function getAdminStats() {
  const [
    totalUsers, totalVenues, pendingVenues, pendingDocs,
    totalBookings, recentPayments, totalRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.venue.count({ where: { status: "published" } }),
    prisma.venue.count({ where: { status: "pending" } }),
    prisma.document.count({ where: { status: "pending" } }),
    prisma.booking.count(),
    prisma.payment.findMany({
      where: { status: "succeeded" },
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        booking: { include: { venue: { select: { name: true } }, user: { select: { email: true } } } },
      },
    }),
    prisma.payment.aggregate({
      where: { status: "succeeded" },
      _sum: { commission_amount: true },
    }),
  ]);

  return { totalUsers, totalVenues, pendingVenues, pendingDocs, totalBookings, recentPayments, totalRevenue };
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) redirect("/login");

  try {
    const payload = await verifyToken(token);
    if (payload.role !== "admin") redirect("/client");
  } catch {
    redirect("/login");
  }

  const { totalUsers, totalVenues, pendingVenues, pendingDocs, totalBookings, recentPayments, totalRevenue } =
    await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1410]" style={{ fontFamily: "Playfair Display, serif" }}>
          Administration
        </h1>
        <p className="text-sm text-[#1A1410]/60 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Alertes */}
      {(pendingVenues > 0 || pendingDocs > 0) && (
        <div className="space-y-2">
          {pendingVenues > 0 && (
            <Link href="/admin/venues?status=pending" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors">
              <span className="text-sm font-medium text-amber-800">
                {pendingVenues} espace{pendingVenues > 1 ? "s" : ""} en attente de validation
              </span>
              <span className="text-amber-600 text-sm">→</span>
            </Link>
          )}
          {pendingDocs > 0 && (
            <Link href="/admin/documents" className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors">
              <span className="text-sm font-medium text-amber-800">
                {pendingDocs} document{pendingDocs > 1 ? "s" : ""} KYC à vérifier
              </span>
              <span className="text-amber-600 text-sm">→</span>
            </Link>
          )}
        </div>
      )}

      {/* Stats KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Utilisateurs", value: totalUsers, href: "/admin/users" },
          { label: "Espaces publiés", value: totalVenues, href: "/admin/venues" },
          { label: "Réservations", value: totalBookings, href: "/admin/bookings" },
          { label: "Commission totale", value: `${Number(totalRevenue._sum.commission_amount ?? 0).toLocaleString("fr-FR")} €`, href: "/admin/reporting" },
        ].map(({ label, value, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-[#ede7e0] p-4 hover:border-[#C4622D] transition-colors">
            <p className="text-2xl font-bold text-[#1A1410]">{value}</p>
            <p className="text-xs text-[#1A1410]/60 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Paiements récents */}
      <div className="bg-white rounded-xl border border-[#ede7e0] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1A1410]">Paiements récents</h2>
          <Link href="/admin/payments" className="text-sm text-[#C4622D] hover:underline">Voir tout</Link>
        </div>
        {recentPayments.length === 0 ? (
          <p className="text-sm text-[#1A1410]/50 text-center py-4">Aucun paiement</p>
        ) : (
          <div className="space-y-2">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#ede7e0] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1A1410]">{p.booking.venue.name}</p>
                  <p className="text-xs text-[#1A1410]/50">{p.booking.user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#C4622D]">{Number(p.amount).toLocaleString("fr-FR")} {p.currency}</p>
                  <p className="text-xs text-[#1A1410]/40">comm. {Number(p.commission_amount ?? 0).toLocaleString("fr-FR")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: "/admin/venues?status=pending", label: "Valider des espaces" },
          { href: "/admin/documents", label: "Vérifier le KYC" },
          { href: "/admin/config", label: "Configuration" },
        ].map(({ href, label }) => (
          <Link key={href} href={href} className="btn-secondary text-sm text-center py-2.5">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
