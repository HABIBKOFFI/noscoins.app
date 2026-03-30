import { prisma } from "@/lib/prisma";

export async function updateVenueLocation(
  venueId: string,
  longitude: number,
  latitude: number
) {
  await prisma.$executeRaw`
    UPDATE "Venue"
    SET location = ST_MakePoint(${longitude}, ${latitude})::geography
    WHERE id = ${venueId}
  `;
}

export async function searchVenuesByLocation(
  lat: number,
  lng: number,
  radiusMeters: number,
  filters: { capacity?: number; minPrice?: number; maxPrice?: number } = {}
) {
  const conditions: string[] = [
    `ST_DWithin(v.location, ST_MakePoint(${lng}, ${lat})::geography, ${radiusMeters})`,
    `v.status = 'published'`,
  ];

  if (filters.capacity) {
    conditions.push(`v.capacity_seat >= ${filters.capacity}`);
  }
  if (filters.minPrice != null) {
    conditions.push(`v.base_price >= ${filters.minPrice}`);
  }
  if (filters.maxPrice != null) {
    conditions.push(`v.base_price <= ${filters.maxPrice}`);
  }

  const where = conditions.join(" AND ");

  return prisma.$queryRawUnsafe<
    Array<{ id: string; name: string; distance_km: number }>
  >(`
    SELECT
      v.*,
      ST_Distance(v.location, ST_MakePoint(${lng}, ${lat})::geography) / 1000 AS distance_km
    FROM "Venue" v
    WHERE ${where}
    ORDER BY distance_km ASC
    LIMIT 20
  `);
}
