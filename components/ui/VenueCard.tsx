import Link from "next/link";
import Image from "next/image";

interface VenueCardProps {
  id: string;
  name: string;
  city: string | null;
  base_price: number | string | null;
  currency: string | null;
  capacity_seat: number | null;
  status?: string;
  photo?: string | null;
  avgScore?: number | null;
  bookingCount?: number;
}

function formatPrice(amount: number | string | null, currency: string | null) {
  if (!amount) return "–";
  const n = Number(amount);
  if (currency === "XOF") return `${n.toLocaleString("fr-FR")} FCFA`;
  return `${n.toLocaleString("fr-FR")} €`;
}

export default function VenueCard({
  id, name, city, base_price, currency, capacity_seat,
  status, photo, avgScore, bookingCount,
}: VenueCardProps) {
  return (
    <Link href={`/venues/${id}`} className="venue-card group">
      <div className="relative h-48 bg-[#ede7e0] overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full brand-pattern flex items-center justify-center">
            <span className="text-4xl opacity-30">📍</span>
          </div>
        )}
        {status && status !== "published" && (
          <span className={`absolute top-3 left-3 badge text-xs ${
            status === "pending" ? "badge-warning" :
            status === "validated" ? "badge-success" :
            "badge-error"
          }`}>
            {status === "pending" ? "En attente" : status === "validated" ? "Validé" : "Suspendu"}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[#1A1410] text-base leading-snug line-clamp-1">{name}</h3>
        <p className="text-sm text-[#1A1410]/60 mt-0.5">
          {city}
          {capacity_seat ? ` · ${capacity_seat} pers.` : ""}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-[#C4622D] font-bold text-base">
            {formatPrice(base_price, currency)}
          </span>
          <div className="flex items-center gap-2 text-xs text-[#1A1410]/50">
            {avgScore != null && (
              <span>★ {avgScore.toFixed(1)}</span>
            )}
            {bookingCount != null && (
              <span>{bookingCount} rés.</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
