import type { UserType, VenueStatus, BookingStatus, PaymentMethod, Currency } from "@prisma/client";

export type { UserType, VenueStatus, BookingStatus, PaymentMethod, Currency };

export interface JwtPayload {
  userId: string;
  role: UserType;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface VenueSearchParams {
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number; // km
  capacity?: number;
  currency?: Currency;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
