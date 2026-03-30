import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding database...");

  // ── USERS ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@noscoins.com" },
    update: {},
    create: {
      type: "admin",
      email: "admin@noscoins.com",
      password_hash: passwordHash,
      phone: "+33600000001",
      country_code: "FR",
      account_status: "active",
    },
  });

  const ownerParis = await prisma.user.upsert({
    where: { email: "owner.paris@noscoins.com" },
    update: {},
    create: {
      type: "owner",
      email: "owner.paris@noscoins.com",
      password_hash: passwordHash,
      phone: "+33600000002",
      country_code: "FR",
      account_status: "active",
    },
  });

  const ownerAbidjan = await prisma.user.upsert({
    where: { email: "owner.abidjan@noscoins.com" },
    update: {},
    create: {
      type: "owner",
      email: "owner.abidjan@noscoins.com",
      password_hash: passwordHash,
      phone: "+2250700000001",
      country_code: "CI",
      account_status: "active",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@noscoins.com" },
    update: {},
    create: {
      type: "client",
      email: "client@noscoins.com",
      password_hash: passwordHash,
      phone: "+33600000003",
      country_code: "FR",
      account_status: "active",
    },
  });

  // ── VENUES ─────────────────────────────────────────────
  const venueParis = await prisma.venue.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      owner_id: ownerParis.id,
      name: "Loft Marais",
      city: "Paris",
      address: "12 rue de Bretagne, 75003 Paris",
      latitude: 48.8637,
      longitude: 2.359,
      capacity_seat: 80,
      capacity_stand: 120,
      base_price: 1200,
      currency: "EUR",
      status: "published",
      booking_mode: "instant",
      balance_due_days_before: 30,
    },
  });

  const venueAbidjan = await prisma.venue.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      owner_id: ownerAbidjan.id,
      name: "Villa Cocody",
      city: "Abidjan",
      address: "Cocody Riviera, Abidjan",
      latitude: 5.36,
      longitude: -3.98,
      capacity_seat: 200,
      capacity_stand: 350,
      base_price: 350000,
      currency: "XOF",
      status: "published",
      booking_mode: "request",
      balance_due_days_before: 14,
    },
  });

  // ── SERVICES ───────────────────────────────────────────
  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      {
        venue_id: venueParis.id,
        name: "Sono + éclairage",
        price: 300,
        currency: "EUR",
        type: "optional",
        category: "music",
      },
      {
        venue_id: venueParis.id,
        name: "Agent de sécurité",
        price: 150,
        currency: "EUR",
        type: "mandatory",
        category: "security",
      },
      {
        venue_id: venueAbidjan.id,
        name: "Traiteur buffet",
        price: 50000,
        currency: "XOF",
        type: "optional",
        category: "catering",
      },
    ],
  });

  // ── AVAILABILITY — 30 days for each venue ───────────────
  const today = new Date();
  const availabilityData = [];

  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);

    availabilityData.push(
      {
        venue_id: venueParis.id,
        date,
        start_time: "09:00",
        end_time: "23:00",
      },
      {
        venue_id: venueAbidjan.id,
        date,
        start_time: "08:00",
        end_time: "23:00",
      }
    );
  }

  await prisma.availability.createMany({
    skipDuplicates: true,
    data: availabilityData,
  });

  // ── BOOKING (confirmed) ─────────────────────────────────
  const booking = await prisma.booking.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      venue_id: venueParis.id,
      user_id: client.id,
      status: "paid",
      total_price: 1500,
      deposit_amount: 450,
      service_fee_amount: 50,
      service_fee_currency: "EUR",
      client_currency: "EUR",
      owner_currency: "EUR",
    },
  });

  // ── QUOTE (pending) ─────────────────────────────────────
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 45);

  await prisma.quote.upsert({
    where: { id: "00000000-0000-0000-0000-000000000020" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000020",
      venue_id: venueAbidjan.id,
      client_id: client.id,
      status: "pending",
      requested_date: futureDate,
      proposed_price: 350000,
      message:
        "Bonjour, je souhaite réserver pour un mariage de 180 personnes.",
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  // ── CONFIG ─────────────────────────────────────────────
  const configs = [
    { key: "commission_rate_eu", value: "0.12", description: "Taux de commission Europe (12%)" },
    { key: "commission_rate_ci", value: "0.12", description: "Taux de commission Côte d'Ivoire (12%)" },
    { key: "booking_lock_minutes", value: "15", description: "Durée du lock en minutes" },
    { key: "service_fee_eur", value: "50", description: "Frais de service Europe (€)" },
    { key: "service_fee_xof", value: "10000", description: "Frais de service CI (FCFA)" },
    { key: "owner_cancellation_penalty_rate", value: "0.30", description: "Pénalité propriétaire (30%)" },
    { key: "quote_expiry_hours", value: "48", description: "Délai de réponse devis (heures)" },
    { key: "request_booking_expiry_hours", value: "48", description: "Délai d'acceptation mode request" },
    { key: "premium_price_eur", value: "29", description: "Prix abonnement Premium (€/mois)" },
    { key: "premium_price_xof", value: "19000", description: "Prix abonnement Premium (FCFA/mois)" },
    { key: "premium_trial_days", value: "14", description: "Durée de l'essai gratuit Premium (jours)" },
  ];

  for (const config of configs) {
    await prisma.config.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: { ...config, updated_by: admin.id },
    });
  }

  console.log(`Seed terminé : 4 users, 2 venues, 3 services, ${availabilityData.length} créneaux, 1 booking, 1 quote, ${configs.length} configs`);
  console.log("\nComptes de test (mot de passe: password123) :");
  console.log("  Admin         : admin@noscoins.com");
  console.log("  Owner Paris   : owner.paris@noscoins.com");
  console.log("  Owner Abidjan : owner.abidjan@noscoins.com");
  console.log("  Client        : client@noscoins.com");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
