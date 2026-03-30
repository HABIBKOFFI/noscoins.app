# CLAUDE.md — Noscoins

> Fichier de contexte projet pour Claude Code.  
> À placer à la racine du repo. Ne jamais committer les valeurs de secrets.

---

## 1. Vision produit

**Noscoins** — *L'espace qui rassemble vos plus beaux moments.*

Marketplace de réservation d'espaces événementiels (mariages, séminaires, anniversaires, tournages, soirées…).

- **Zones géographiques** : Europe (France, Belgique) + Afrique de l'Ouest (focus Côte d'Ivoire)
- **Modèle** : commission par transaction (taux configurable par l'admin)
- **Roles** : `client` | `owner` (propriétaire d'espace) | `admin`
- **Objectif conversion** : demande de devis → réservation ≥ 20 %

---

## 2. Personas & rôles

| Rôle | Description | Permissions clés |
|---|---|---|
| `client` | Particulier ou entreprise cherchant un espace | Rechercher, réserver, payer, laisser un avis |
| `owner` | Propriétaire d'un ou plusieurs espaces | Créer/gérer espaces, répondre aux devis, recevoir les paiements |
| `admin` | Équipe Noscoins | Valider espaces, modérer, configurer, voir tous les KPI |

- Un `owner` peut aussi être `client` — prévoir des comptes distincts ou un champ `roles[]`.
- L'`admin` ne peut pas effectuer de réservation en son nom propre.

---

## 3. Identité visuelle

**Ne jamais s'écarter de cette charte dans les interfaces générées.**

| Élément | Valeur |
|---|---|
| Nom | Noscoins |
| Tagline | *L'espace qui rassemble vos plus beaux moments.* |
| Logo | Pin de localisation (terracotta) + cercle or au centre |

### Palette officielle

| Nom | Hex | Usage |
|---|---|---|
| Terracotta | `#C4622D` | Couleur primaire — CTA, liens, icône logo |
| Or | `#E8A838` | Couleur secondaire — accents, highlights |
| Nuit | `#1A1410` | Texte, fonds sombres |
| Ivoire | `#FBF5F0` | Fond principal, espaces |

### Typographie

| Rôle | Police | Style |
|---|---|---|
| Titres (H1, H2, accroche, slogan) | **Playfair Display** | Serif — élégance premium |
| Corps, UI, labels | **Inter** ou **DM Sans** | Sans-serif — propre, lisible, universel |

**Hiérarchie typographique :**
- H1 — Titre : Playfair Display, grande taille (ex : *Trouvez votre espace idéal*)
- H2 — Sous-titre : Playfair Display, taille moyenne (ex : *Espaces disponibles à Paris*)
- Body — Corps : Inter / DM Sans (ex : *Réservez en quelques clics, sans intermédiaire.*)
- Caption — Note : Inter / DM Sans, petite taille (ex : *Disponible · 250 personnes · Paris 8e*)

**Règle absolue : serif pour les titres, sans-serif pour le corps. Ne jamais mélanger sur un même support.**

### Composants UI

**Boutons :**
- Primaire : fond terracotta `#C4622D`, texte blanc → *Réserver*
- Secondaire : contour terracotta, texte terracotta, fond transparent → *Demander un devis*
- Tertiaire / ghost : contour neutre, texte neutre → *En savoir plus*

**Tags & badges :**
- Pill arrondi, fond ivoire ou neutre clair, texte nuit
- Tag actif / sélectionné : fond terracotta, texte blanc

**Carte espace :**
- Fond sombre ou ivoire selon le contexte
- Nom de l'espace : gras, texte clair
- Sous-titre : ville · type · capacité
- Prix : terracotta `#C4622D`, mis en avant
- Badge disponibilité : pill arrondi (ex : *Disponible*)

**Pattern de marque :**
- Motif de fond officiel : cercles terracotta semi-transparents sur fond ivoire
- Usage : arrière-plans de sections, posts réseaux sociaux, supports print

### Do's & Don'ts

**À faire :**
- Toujours utiliser le terracotta comme couleur principale
- Respecter l'espace autour du logo (≥ hauteur du pin)
- Utiliser l'ivoire comme fond par défaut
- Slogan complet sur les supports de communication
- Serif pour les titres, sans-serif pour le corps

**À éviter :**
- Ne jamais déformer ou étirer le logo
- Ne pas utiliser d'autres couleurs non validées
- Ne pas placer le logo sur un fond chargé sans fond neutre intercalé
- Ne pas tronquer le slogan (*"L'espace qui rassemble…"*)
- Ne pas mélanger serif et sans-serif — un seul type par support

### Déclinaisons logo
- App / web : icône grande taille
- Header : icône taille moyenne
- Favicon : icône petite taille
- Fond ivoire / blanc / sombre : toutes les variantes sont validées

---

## 4. Stack technique

### Contrainte budgétaire
**Budget V1 : 0€/mois** (hors domaine `noscoins.app` déjà acheté sur Vercel).
Tous les services ci-dessous ont un tier gratuit suffisant pour le lancement.

```
Framework    : Next.js 14+ (TypeScript, App Router, SSR + Route Handlers)
Base de données : PostgreSQL + PostGIS → Supabase Free
ORM          : Prisma (compatible Supabase)
Cache        : Upstash Redis Free (10 000 commandes/jour)
Queue async  : Upstash QStash Free (500 messages/jour)
Paiements EU : Stripe Connect (% par transaction, 0€ fixe)
Paiements CI : CinetPay (% par transaction, 0€ fixe)
Storage      : Cloudinary Free (25 crédits/mois)
Email        : Resend Free (3 000 emails/mois)
Monitoring   : Sentry Free (5 000 erreurs/mois)
Infra        : Vercel Hobby (domaine noscoins.app inclus)
Node.js      : v20 LTS minimum
Package mgr  : pnpm
```

### Coût mensuel V1

| Service | Plan | Coût |
|---|---|---|
| Vercel Hobby | Domaine acheté | 0€/mois |
| Supabase | Free tier | 0€/mois |
| Upstash Redis | Free tier | 0€/mois |
| Upstash QStash | Free tier | 0€/mois |
| Cloudinary | Free tier | 0€/mois |
| Resend | Free tier | 0€/mois |
| Sentry | Free tier | 0€/mois |
| Stripe | 1.4% + 0.25€/transaction | 0€ fixe |
| CinetPay | ~2.5%/transaction | 0€ fixe |
| **Total fixe** | | **0€/mois** |

### Pourquoi cette stack
- **Next.js Route Handlers** : API serverless sur Vercel, pas de serveur à gérer, déploiement automatique sur push
- **Supabase** : PostgreSQL + PostGIS natif inclus, dashboard visuel, backups automatiques
- **Upstash** : Redis et QStash serverless — compatibles avec l'environnement sans état de Vercel
- **Prisma** : migrations versionnées, autocomplétion TypeScript, raw queries pour PostGIS

### Limites des tiers gratuits à surveiller

| Service | Limite | Action si dépassé |
|---|---|---|
| Supabase | 500MB DB, 5GB bandwidth | Passer à Pro (25$/mois) |
| Upstash Redis | 10 000 cmd/jour | Passer à Pay-as-you-go |
| Upstash QStash | 500 msg/jour | Passer à Pay-as-you-go |
| Cloudinary | 25 crédits/mois | Optimiser les images ou passer au plan Plus |
| Resend | 3 000 emails/mois | Passer à Pro (20$/mois) |
| Vercel Hobby | 100GB bandwidth | Passer à Pro (20$/mois) |

→ Ces limites sont largement suffisantes pour un lancement (0–500 utilisateurs).

---

## 5. Structure du repo

### Projet Next.js unique (tout sur Vercel)

L'API est intégrée dans Next.js via les Route Handlers (`app/api/`).
Pas de monorepo nécessaire en V1 — un seul repo, un seul déploiement Vercel.

```
noscoins/
├── CLAUDE.md
├── package.json
├── next.config.ts
├── .env.local              ← Variables locales (jamais committé)
├── .env.example            ← Template des variables
│
├── app/
│   ├── (public)/           ← Pages publiques (SEO, SSR)
│   │   ├── page.tsx            ← Homepage
│   │   ├── search/             ← Recherche d'espaces
│   │   └── venues/[id]/        ← Fiche espace (SSR pour SEO)
│   ├── (auth)/             ← Login, inscription
│   ├── client/             ← Dashboard client (SSR protégé)
│   ├── owner/              ← Dashboard propriétaire
│   ├── admin/              ← Dashboard admin
│   └── api/                ← Route Handlers (API serverless)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── refresh/route.ts
│       ├── venues/route.ts
│       ├── venues/[id]/route.ts
│       ├── bookings/route.ts
│       ├── payments/route.ts
│       ├── quotes/route.ts
│       ├── messages/route.ts
│       ├── admin/route.ts
│       └── webhooks/
│           ├── stripe/route.ts
│           ├── cinetpay/route.ts
│           └── qstash/route.ts  ← Jobs async (QStash → ici)
│
├── components/
│   ├── ui/                 ← Design system Noscoins (#C4622D, Playfair, Inter)
│   ├── map/                ← Carte interactive
│   └── payment/            ← Tunnel de paiement
│
├── lib/
│   ├── prisma.ts           ← Client Prisma singleton (CRITIQUE — voir section 42)
│   ├── redis.ts            ← Client Upstash Redis
│   ├── qstash.ts           ← Client Upstash QStash
│   ├── stripe.ts           ← Client Stripe
│   ├── cinetpay.ts         ← Client CinetPay
│   ├── cloudinary.ts       ← Client Cloudinary
│   ├── resend.ts           ← Client Resend
│   └── auth.ts             ← Helpers JWT
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg            ← Logo Noscoins (pin terracotta)
│   ├── sitemap.xml         ← Généré automatiquement
│   └── robots.txt
│
└── types/
    └── index.ts            ← Types TypeScript partagés
```

---

## 6. Commandes essentielles

```bash
# Installation
pnpm install

# Développement local
pnpm dev                    # Next.js sur http://localhost:3000

# Base de données (Prisma)
pnpm prisma migrate dev     # Créer + appliquer une migration
pnpm prisma migrate reset   # Reset complet (dev uniquement)
pnpm prisma generate        # Régénérer le client Prisma
pnpm prisma studio          # Interface visuelle sur http://localhost:5555
pnpm prisma db push         # Push schéma sans migration (prototypage rapide)

# Seed
pnpm prisma db seed         # Injecter les données de démo

# Tests
pnpm test                   # Tests unitaires (Jest)
pnpm test:e2e               # Tests end-to-end (Playwright)

# Build + vérifications
pnpm build
pnpm lint
pnpm typecheck

# Déploiement
# Automatique sur push → main (Vercel CI/CD)
# Preview sur chaque PR (Vercel Preview URLs)
```

### Variables d'environnement locales
Copier `.env.example` → `.env.local` à la racine.
Ne jamais committer `.env.local`.
Vercel injecte les variables de production via son dashboard (Settings → Environment Variables).

---

## 7. Variables d'environnement requises

Ne jamais committer les valeurs réelles. Référence : `.env.example`.
En production : injecter via le dashboard Vercel (Settings → Environment Variables).

```bash
# ── BASE DE DONNÉES (Supabase) ─────────────────────────────
DATABASE_URL=                  # postgresql://...supabase.co:5432/postgres
DIRECT_URL=                    # Pour les migrations Prisma (connection directe)

# ── CACHE (Upstash Redis) ──────────────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ── QUEUE ASYNC (Upstash QStash) ──────────────────────────
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=    # Vérification des webhooks QStash
QSTASH_NEXT_SIGNING_KEY=

# ── STRIPE (Europe) ───────────────────────────────────────
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Clé publique pour le front (préfixe NEXT_PUBLIC_ obligatoire)
STRIPE_WEBHOOK_SECRET=         # whsec_... (vérification signature)
STRIPE_PLATFORM_ACCOUNT_ID=

# ── CINETPAY (Côte d'Ivoire) ──────────────────────────────
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
CINETPAY_NOTIFY_URL=https://noscoins.app/api/webhooks/cinetpay
CINETPAY_RETURN_URL=https://noscoins.app/payment/confirm

# ── STORAGE (Cloudinary) ──────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ── EMAIL (Resend) ─────────────────────────────────────────
RESEND_API_KEY=
EMAIL_FROM=noreply@noscoins.app

# ── MONITORING (Sentry) ───────────────────────────────────
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=        # Exposé au client pour le front

# ── APP ───────────────────────────────────────────────────
# Auth : JWT custom (pas de NextAuth.js en V1 — trop lourd pour ce cas)
JWT_SECRET=                    # Min 32 caractères aléatoires (openssl rand -base64 32)
# NEXTAUTH_SECRET → supprimé (non utilisé)
NEXT_PUBLIC_APP_URL=https://noscoins.app

# ── DEVISES ───────────────────────────────────────────────
# Europe : EUR (€) | Côte d'Ivoire : XOF (FCFA)
# Taux fixe : 1 EUR = 655.957 XOF (arrimé par traité — pas d'API nécessaire)
# EXCHANGE_RATE_API_KEY → supprimé (inutile en V1)
```

---

## 8. Schéma de base de données

### Tables et relations principales

| Table | Rôle | Relations clés |
|---|---|---|
| `User` | Client, propriétaire ou admin | → Venue, Booking, Wallet |
| `Venue` | Espace événementiel | owner_id → User |
| `Availability` | Créneaux dispo + lock | venue_id → Venue, locked_by_user_id → User |
| `Booking` | Réservation | venue_id, user_id, quote_id → User/Venue/Quote |
| `Payment` | Transaction financière | booking_id → Booking |
| `Wallet` | Solde interne (Côte d'Ivoire) | user_id → User |
| `Payout` | Virement sortant | wallet_id → Wallet |
| `Service` | Traiteur, DJ, déco, etc. | venue_id → Venue |
| `BookingService` | Services inclus dans une réservation | booking_id, service_id |
| `Event` | Tracking analytics (nullable) | user_id, venue_id, booking_id |
| `Message` | Messagerie client ↔ propriétaire | booking_id → Booking |
| `Review` | Avis multi-critères post-réservation | booking_id, venue_id, user_id |
| `Document` | Pièces KYC propriétaire | user_id → User |
| `Quote` | Demande de devis + négociation | venue_id, client_id → User |
| `Favorite` | Shortlist espaces client | user_id, venue_id |
| `Notification` | Notifications in-app | user_id → User |
| `UserSession` | Refresh tokens JWT | user_id → User |
| `Config` | Paramétrage global admin | — |
| `AuditLog` | Logs d'actions sensibles | actor_id → User |

### Statuts de réservation (`Booking.status`)

```
draft → locked ──────────────────────────────┐
           ↓                                  ↓
        confirmed → paid → completed       cancelled
           ↓          ↓
        cancelled   cancelled
```

- `locked → cancelled` : lock expiré (cron) ou refus propriétaire (mode `request`)
- `confirmed → cancelled` : annulation avant paiement du solde
- `paid → cancelled` : annulation post-paiement (remboursement selon politique)

### Schéma SQL complet

```sql
CREATE TABLE "User" (
  id UUID PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('client','owner','admin')) NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  country_code TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Venue" (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES "User"(id) NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  latitude FLOAT,
  longitude FLOAT,
  location GEOGRAPHY(POINT, 4326),         -- PostGIS
  capacity_seat INT,
  capacity_stand INT,
  base_price NUMERIC,
  currency TEXT CHECK (currency IN ('EUR','XOF')),  -- EUR Europe, XOF Côte d'Ivoire
  status VARCHAR(20) CHECK (status IN ('pending','validated','published','suspended')) DEFAULT 'pending',
  booking_mode VARCHAR(20) CHECK (booking_mode IN ('instant','request')) DEFAULT 'instant',
  balance_due_days_before INT DEFAULT 30,
  is_off_market BOOLEAN DEFAULT FALSE,
  secret_link TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Availability" (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES "Venue"(id) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  blocked BOOLEAN DEFAULT FALSE,
  locked_until TIMESTAMP,
  locked_by_user_id UUID REFERENCES "User"(id),
  locked_booking_id UUID REFERENCES "Booking"(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Booking" (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES "Venue"(id) NOT NULL,
  user_id UUID REFERENCES "User"(id) NOT NULL,
  quote_id UUID REFERENCES "Quote"(id),  -- renseigné si issu d'un devis accepté
  status VARCHAR(20) CHECK (
    status IN ('draft','locked','confirmed','paid','cancelled','completed')
  ) NOT NULL,
  total_price NUMERIC NOT NULL,
  deposit_amount NUMERIC,
  service_fee_amount NUMERIC,            -- frais de service (non remboursables)
  service_fee_currency TEXT,             -- EUR ou XOF
  client_currency TEXT,
  owner_currency TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Payment" (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES "Booking"(id) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  exchange_rate NUMERIC,
  amount_converted NUMERIC,
  commission_amount NUMERIC,
  commission_currency TEXT,
  method VARCHAR(50) CHECK (method IN ('card','apple_pay','google_pay','sepa','orange_money','mtn','moov','wave')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending','succeeded','failed','refunded')) NOT NULL,
  psp_reference TEXT,
  refund_amount NUMERIC,
  refund_reason TEXT,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Wallet" (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES "User"(id) NOT NULL,
  balance NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Payout" (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES "Wallet"(id) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  payout_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Service" (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES "Venue"(id) NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('mandatory','optional')),
  category VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "BookingService" (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES "Booking"(id) NOT NULL,
  service_id UUID REFERENCES "Service"(id) NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Event" (
  id UUID PRIMARY KEY,
  user_id UUID,
  venue_id UUID,
  booking_id UUID,
  event_type VARCHAR(50) NOT NULL,
  properties JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. Règles métier critiques

### 9.1 Verrouillage de créneau (LOCK)

**Ne jamais modifier ce mécanisme sans valider avec toute l'équipe.**

- Quand un client démarre une réservation (`start_booking`) :
  - `Availability.locked_until` = `NOW() + BOOKING_LOCK_DURATION_MINUTES`
  - `Availability.locked_by_user_id` = id du client
  - `Booking.status` passe à `locked`
  - `Booking.expires_at` = même timestamp que `locked_until`
- Un seul client peut locker un créneau à la fois.
- Un job automatique (cron ou event-driven) libère les locks expirés :
  - Si `NOW() > locked_until` → reset des champs lock sur `Availability`
  - `Booking.status` → `cancelled`
- Pendant un lock actif, le créneau doit apparaître **indisponible** pour tous les autres clients.

### 9.2 Calcul du prix total

```
Booking.total_price = Venue.base_price + SUM(BookingService.total_price)
Commission          = total_price × COMMISSION_RATE
Montant propriétaire = total_price - commission
```

La commission est toujours calculée **sur le montant total** (base + services).

**Règle de prélèvement :**
- Commission = `total_price × 0.12`
- Prélevée **au moment de l'acompte** (pas au solde)
- `Payment.commission_amount` = `total_price × 0.12` (pas `deposit_amount × 0.12`)
- Le propriétaire reçoit : `deposit_amount - commission_amount` à l'acompte, puis le solde net.

### 9.3 Flux de paiement — Europe (Stripe Connect)

1. Client paie → Stripe Checkout
2. Stripe prélève la commission automatiquement (`application_fee_amount`)
3. Stripe transfère le solde au compte connecté du propriétaire
4. Webhook `payment_intent.succeeded` → `Booking.status = paid`
5. Log dans `Payment` (avec `psp_reference` = Stripe PaymentIntent ID)

**Ne jamais confirmer une réservation sans confirmation du webhook.**  
Ne pas se fier au retour front-end seul.

### 9.4 Flux de paiement — Côte d'Ivoire (wallet interne)

1. Client paie via PSP mobile money (Orange Money, MTN, Moov, Wave)
2. Callback PSP → crédit du `Wallet` du propriétaire (balance interne)
3. Régularisation quotidienne/hebdomadaire → `Payout` vers compte bancaire ou PSP
4. `Payment.exchange_rate` et `Payment.amount_converted` doivent être renseignés au moment de la transaction (taux figé)

### 9.5 Multi-devises

- Le taux de change est **figé au moment de la transaction**, jamais recalculé après.
- Stocker dans `Payment` : `amount`, `currency`, `exchange_rate`, `amount_converted`.
- Ne jamais recalculer rétroactivement un montant converti.

### 9.6 Services additionnels

- Un `Service` peut être `mandatory` ou `optional`.
- Les services `mandatory` doivent être ajoutés automatiquement à `BookingService` à la création du booking.
- Le prix final ne peut être confirmé qu'une fois tous les `BookingService` rattachés.

---

## 10. Tables complémentaires

### 10.1 Messagerie (`Message`)

Messagerie intégrée entre client et propriétaire, rattachée à une réservation.

```sql
CREATE TABLE "Message" (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES "Booking"(id) NOT NULL,
  sender_id UUID REFERENCES "User"(id) NOT NULL,
  receiver_id UUID REFERENCES "User"(id) NOT NULL,
  content TEXT,
  attachment_url TEXT,
  attachment_type VARCHAR(50),
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- `attachment_url` : lien vers le fichier stocké (S3 / Cloudinary).
- `attachment_type` : `image`, `pdf`, `document`, etc.
- Ne jamais exposer d'URL signée sans vérification des droits (sender ou receiver uniquement).

### 10.2 Avis (`Review`)

Avis multi-critères laissé par le client après la réservation (`Booking.status = completed`).

```sql
CREATE TABLE "Review" (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES "Booking"(id) NOT NULL UNIQUE,
  venue_id UUID REFERENCES "Venue"(id) NOT NULL,
  user_id UUID REFERENCES "User"(id) NOT NULL,
  score_cleanliness INT CHECK (score_cleanliness BETWEEN 1 AND 5),
  score_welcome INT CHECK (score_welcome BETWEEN 1 AND 5),
  score_value INT CHECK (score_value BETWEEN 1 AND 5),
  score_overall INT CHECK (score_overall BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- Un seul avis par réservation (`UNIQUE` sur `booking_id`).
- Avis possible uniquement si `Booking.status = completed`.
- Score global affiché sur la fiche espace = moyenne de `score_overall`.

### 10.3 Documents KYC (`Document`)

Pièces justificatives soumises par le propriétaire pour validation admin.

```sql
CREATE TABLE "Document" (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES "User"(id) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('identity','rib','business_registration','other')) NOT NULL,
  file_url TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES "User"(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- Un espace ne peut pas être publié (`Venue.status = published`) si les documents du propriétaire ne sont pas tous `approved`.
- `reviewed_by` doit être un `User.type = admin`.

### 10.4 Workflow de validation d'un espace

Le champ `Venue.status` est défini dans le schéma principal (section 8 — `CREATE TABLE "Venue"`).

| Statut | Description |
|---|---|
| `pending` | Soumis par le propriétaire, en attente de review admin |
| `validated` | Documents KYC approuvés, en attente de publication |
| `published` | Visible publiquement dans la recherche |
| `suspended` | Masqué suite à un litige ou une infraction |

- Seul un admin peut faire passer un espace de `pending` → `validated` → `published`.
- Un espace `suspended` n'accepte plus de nouvelles réservations.
- Les réservations existantes sur un espace `suspended` ne sont pas annulées automatiquement — gestion manuelle par l'admin.

---

## 11. Règles financières détaillées

### 11.1 Acompte et solde

- **Acompte** : 30 % du `total_price`, prélevé au moment de la confirmation de réservation (`Booking.status → confirmed`).
- **Solde** (70 % restant) : date définie par le propriétaire lors de la création de l'espace.
  - Stocker dans `Venue` : `balance_due_days_before INT` (ex : `30` = solde dû 30 jours avant l'événement).
  - Générer un rappel automatique à cette date.
- `Booking.deposit_amount` = `total_price × 0.30` (figé à la création du booking).

### 11.2 Politique d'annulation

| Délai avant l'événement | Remboursement client | Propriétaire |
|---|---|---|
| > 30 jours | 100 % sauf frais de service | Rien retenu |
| 7 à 30 jours | 70 % (acompte retenu) | Conserve l'acompte |
| < 7 jours | 0 % | Conserve l'acompte |
| Annulation propriétaire | 100 % remboursé + dédommagement | Pénalité prélevée |

**Frais de service** : frais fixes de la plateforme, non remboursables en toute circonstance. Montant configurable par l'admin.

**Annulation propriétaire** :
- Remboursement intégral au client (acompte inclus).
- Pénalité prélevée sur le wallet ou le prochain payout du propriétaire.
- Montant de la pénalité : configurable par l'admin (ex : équivalent de l'acompte).
- `Booking.status → cancelled`, log dans `Event` (`booking_cancelled`).

**Règle d'implémentation** :
- Ne jamais rembourser sans vérifier le `Booking.status` et la date de l'événement.
- Tout remboursement doit générer un enregistrement dans `Payment` (montant négatif ou champ `refund_amount`).

---

## 12. Modèle de monétisation

### Phase 1 — MVP (0–6 mois)
- **Commission unique : 12 %** par transaction
- Prélevée automatiquement sur l'acompte (30 % du total)
- Aucun autre modèle de revenus actif

### Phase 2 (6–12 mois)
- Commission : 12 %
- Abonnement propriétaire : 20–50 € / mois (fonctionnalités avancées)
- Mise en avant sponsorisée dans les résultats de recherche

### Phase 3 (12 mois+)
- Services additionnels (traiteur, DJ, déco) : 10–20 % de commission
- Frais de service client : 3–5 %

> Mettre à jour `Config.commission_rate_default` à `0.12` au seed (et non 0.10).

---

## 13. Stratégie anti-désintermédiation — Côte d'Ivoire

### Règle fondamentale

**L'argent passe toujours par Noscoins.** La commission est prélevée avant reversement au propriétaire. Il n'y a rien à récupérer après.

### Flux de paiement (CI)

```
Client → lien paiement Noscoins → Orange Money / Wave / MTN
       → commission prélevée automatiquement
       → propriétaire reçoit le net
```

### Leviers principaux
- Lien de paiement mobile money **généré par Noscoins** (non contournable)
- Noscoins = garant : acompte remboursable uniquement si paiement via plateforme
- Avis publiables **uniquement après transaction vérifiée**
- Agents terrain : relation humaine avec les propriétaires

### Ce qu'on n'implémente PAS au lancement
- Filtrage automatique des messages
- Blocage WhatsApp (contre-productif en CI)
- CGU avec clause 12 mois (inefficace sans recours légal)
- Contrats électroniques (pas encore un réflexe en CI)

### Règle d'implémentation critique

**Ne jamais reverser le montant total au propriétaire sans avoir d'abord prélevé la commission côté `PaymentService`.**

Ordre d'opérations obligatoire dans `PaymentService` :
1. Réception du paiement client
2. Calcul et prélèvement de la commission (`Payment.commission_amount`)
3. Crédit du wallet propriétaire avec le montant net uniquement
4. Log dans `Payment` et `Payout`

---

## 14. Tracking analytics

Chaque action importante doit générer un enregistrement dans `Event`.

| event_type | Déclencheur |
|---|---|
| `view_venue` | Page fiche espace chargée |
| `click_contact` | Clic sur "Contacter" |
| `request_quote` | Soumission formulaire devis |
| `start_booking` | Début du tunnel de réservation |
| `payment_started` | Redirection vers la page de paiement |
| `payment_success` | Webhook paiement confirmé |
| `payment_failed` | Webhook paiement échoué |
| `booking_cancelled` | Annulation (client ou expiration lock) |

Le champ `properties` (JSONB) doit contenir au minimum : `{ device, country, page }`.

---

## 15. Fonctionnalités client

### 15.1 Types de réservation

Le comportement est défini par `Venue.booking_mode` :

```sql
ALTER TABLE "Venue" ADD COLUMN booking_mode VARCHAR(20)
  CHECK (booking_mode IN ('instant', 'request'))
  DEFAULT 'instant';
```

| Mode | Comportement |
|---|---|
| `instant` | Créneau locké → paiement → `Booking.status = confirmed` automatiquement |
| `request` | Créneau locké → propriétaire accepte/refuse sous 48h → paiement si accepté |

- En mode `request`, si le propriétaire ne répond pas sous 48h → lock libéré, `Booking.status = cancelled`.
- En mode `request`, le client ne paie qu'après acceptation du propriétaire.
- Le lock reste actif pendant toute la durée de la phase de validation.

### 15.2 Comparaison d'espaces

- Maximum **4 espaces** comparables simultanément.
- Critères comparés : prix, capacité, équipements, note moyenne, disponibilité.
- Pas de table BDD nécessaire — comparaison stateless côté front.

### 15.3 Favoris / shortlist

```sql
CREATE TABLE "Favorite" (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES "User"(id) NOT NULL,
  venue_id UUID REFERENCES "Venue"(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, venue_id)
);
```

### 15.4 Historique et documents

- Documents téléchargeables : confirmation de réservation + facture (PDF généré à la volée).
- URLs de téléchargement signées, expiration 15 min.

---

## 16. Fonctionnalités propriétaire

### 16.1 Gestion des demandes de devis

```sql
CREATE TABLE "Quote" (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES "Venue"(id) NOT NULL,
  client_id UUID REFERENCES "User"(id) NOT NULL,
  status VARCHAR(20) CHECK (
    status IN ('pending','countered','accepted','refused','expired')
  ) DEFAULT 'pending',
  requested_date DATE,
  requested_services JSONB,
  proposed_price NUMERIC,
  proposed_date DATE,
  proposed_services JSONB,
  message TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Flux :**
1. Client soumet → `status = pending`
2. Propriétaire : accepte / refuse / contre-propose (prix + date + services) → `status = countered`
3. Si pas de réponse sous 48h → `status = expired`
4. Acceptation → création du `Booking` → tunnel de paiement

### 16.2 CRM simple (V1)

Pas de table dédiée — s'appuie sur les tables existantes :
- Historique interactions : `Message` filtré par propriétaire
- Historique réservations : `Booking` filtré par `venue_id`
- Segmentation : `Booking.status`, `User.country_code`, fréquence

Exposer via `/owner/crm/clients`.

### 16.3 Statistiques d'espace

Endpoint `/owner/venues/:id/stats` :

| Métrique | Calcul |
|---|---|
| Vues | `COUNT(Event) WHERE event_type = 'view_venue'` |
| Taux de conversion | `COUNT(Booking paid) / COUNT(Quote)` |
| Revenus | `SUM(amount - commission_amount)` |
| Taux d'occupation | `jours réservés / jours disponibles × 100` |

- Filtrable par période (7j, 30j, 90j, custom).
- Ne pas calculer en temps réel sur de gros volumes — utiliser des agrégats mis en cache.

---

## 17. Fonctionnalités admin

### 17.1 Gestion des utilisateurs

```sql
ALTER TABLE "User" ADD COLUMN account_status VARCHAR(20)
  CHECK (account_status IN ('active','suspended','blacklisted'))
  DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN suspended_until TIMESTAMP;
ALTER TABLE "User" ADD COLUMN suspension_reason TEXT;
```

| Sanction | Effet | Réversible |
|---|---|---|
| `suspended` | Accès bloqué jusqu'à `suspended_until` | Oui |
| `blacklisted` | Accès définitivement bloqué, email bloqué à l'inscription | Non |

### 17.2 Paramétrage global

```sql
CREATE TABLE "Config" (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES "User"(id),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

| Clé | Valeur par défaut | Description |
|---|---|---|
| `commission_rate_default` | `0.12` | Taux de commission (12%) |
| `booking_lock_minutes` | `15` | Durée du lock en minutes |
| `service_fee_eur` | `50` | Frais de service Europe (€) |
| `service_fee_xof` | `10000` | Frais de service CI (FCFA) |
| `owner_cancellation_penalty_rate` | `0.30` | Pénalité propriétaire (% du total) |
| `quote_expiry_hours` | `48` | Délai de réponse devis |
| `request_booking_expiry_hours` | `48` | Délai d'acceptation mode request |

Ne jamais hardcoder ces valeurs — toujours lire depuis `Config`.

### 17.3 Reporting global

Endpoint `/admin/reporting` : volume réservations, revenus plateforme, taux de conversion global, taux de remplissage moyen, top espaces.

### 17.4 Logs & sécurité

```sql
CREATE TABLE "AuditLog" (
  id UUID PRIMARY KEY,
  actor_id UUID REFERENCES "User"(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Actions à logger obligatoirement : toute action admin, tout paiement, tout remboursement, toute modification de `Booking.status`.

---

## 18. Technique

### 18.1 Notifications (V1 : email + in-app)

```sql
CREATE TABLE "Notification" (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES "User"(id) NOT NULL,
  type VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

| Événement | Destinataire |
|---|---|
| Réservation confirmée | Client + Propriétaire |
| Paiement reçu | Client + Propriétaire |
| Lock expiré | Client |
| Nouveau message | Client ou Propriétaire |
| Devis reçu / répondu | Propriétaire / Client |
| Espace validé par admin | Propriétaire |
| Compte suspendu | Utilisateur concerné |

- Email : transactionnel uniquement (Resend / SendGrid).
- In-app : **Server-Sent Events (SSE)** via un endpoint `/api/notifications/stream` — compatible Vercel, plus efficace que le polling, pas besoin de WebSocket persistant.
- Ne jamais envoyer d'email sans consentement explicite (RGPD).

### 18.2 Recherche géolocalisée

**Décision : PostGIS** (extension PostgreSQL native, déjà incluse dans la stack).

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE "Venue" ADD COLUMN location GEOGRAPHY(POINT, 4326);

-- Requête : espaces dans un rayon de X km
SELECT *, ST_Distance(location, ST_MakePoint(:lng, :lat)::geography) AS distance
FROM "Venue"
WHERE ST_DWithin(location, ST_MakePoint(:lng, :lat)::geography, :radius_meters)
  AND status = 'published'
ORDER BY distance;
```

Mettre à jour `location` à chaque modification de `latitude` / `longitude`.

---

## 19. Corrections schéma BDD

Tous les champs listés ci-dessous sont **déjà intégrés dans les `CREATE TABLE` de la section 8** (schéma consolidé). Ces `ALTER TABLE` sont fournis uniquement pour les migrations sur une base existante.

```sql
-- Si migration sur base existante uniquement
ALTER TABLE "Venue"
  ADD COLUMN IF NOT EXISTS status VARCHAR(20)
    CHECK (status IN ('pending','validated','published','suspended'))
    DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS booking_mode VARCHAR(20)
    CHECK (booking_mode IN ('instant','request'))
    DEFAULT 'instant',
  ADD COLUMN IF NOT EXISTS balance_due_days_before INT DEFAULT 30,
  ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES "Quote"(id);

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS account_status VARCHAR(20)
    CHECK (account_status IN ('active','suspended','blacklisted'))
    DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## 20. Détails techniques

### 20.1 Authentification (JWT)

- **Access token** : expiration **15 minutes**
- **Refresh token** : expiration **7 jours**, stocké en base (`UserSession`) ou Redis
- Rotation du refresh token à chaque usage (invalider l'ancien)
- En cas de refresh token expiré → forcer la reconnexion

```sql
CREATE TABLE "UserSession" (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES "User"(id) NOT NULL,
  refresh_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Ne jamais stocker l'access token en base — il est stateless par définition.

### 20.2 Format des secret_link

- Générés avec **nanoid** (21 caractères alphanumériques)
- Exemple : `aB3kR9mXzQ2pL7wYn4cD8`
- Non devinable, non énumérable (contrairement à un UUID séquentiel)
- Régénéré à chaque modification de `Venue.is_off_market`
- Ne jamais exposer dans les réponses API publiques ni dans les logs

```typescript
import { nanoid } from 'nanoid';
const secretLink = nanoid(21);
```

### 20.3 Valeurs énumérées (`Payment`)

**`Payment.method`** :
```
card | apple_pay | google_pay | sepa |
orange_money | mtn | moov | wave
```

**`Payment.status`** :
```
pending | succeeded | failed | refunded
```

### 20.4 Cache Redis

| Données | Clé | TTL | Invalidation |
|---|---|---|---|
| Lock de créneau | `lock:availability:{id}` | 15 min | À la libération du lock |
| Résultats de recherche | `search:{hash_params}` | 60 s | Automatique |
| Fiche espace | `venue:{id}` | 10 min | À chaque modification |
| Stats propriétaire | `stats:venue:{id}:{period}` | 1 h | Automatique |

- Les locks de créneau sont **la donnée critique** — Redis est la source de vérité, pas PostgreSQL seul.
- Toujours prévoir un fallback PostgreSQL si Redis est indisponible (degraded mode).
- Ne jamais mettre en cache les données de paiement ni les tokens.

### 20.5 Internationalisation

- **V1** : Français + Anglais
- Langue détectée depuis le header `Accept-Language`, modifiable dans le profil utilisateur
- Toutes les chaînes UI doivent passer par un système i18n (ex : `i18next`, `next-intl`)
- Les données métier (noms d'espaces, descriptions) sont saisies dans la langue du propriétaire — pas de traduction automatique en V1
- Les emails transactionnels doivent être disponibles en FR et EN

### 20.6 Format des réponses d'erreur API

Toutes les erreurs API doivent suivre ce format :

```json
{
  "error": {
    "code": "BOOKING_LOCK_EXPIRED",
    "message": "Le créneau n'est plus disponible.",
    "details": {}
  }
}
```

Codes d'erreur standardisés à définir pour les cas critiques :
- `BOOKING_LOCK_EXPIRED` — créneau expiré pendant le paiement
- `VENUE_NOT_AVAILABLE` — espace suspendu ou non publié
- `PAYMENT_FAILED` — échec de paiement PSP
- `QUOTE_EXPIRED` — devis expiré
- `UNAUTHORIZED` — token invalide ou expiré
- `KYC_REQUIRED` — documents propriétaire manquants

---

## 21. Cadre légal

### RGPD (Europe)
- Consentement explicite requis avant tout email marketing.
- Durée de rétention des données personnelles : 3 ans après la dernière activité.
- Champs à ne jamais logger : mots de passe, numéros de carte, tokens de paiement.
- `Event.properties` ne doit pas contenir d'adresse IP ou d'email directement — utiliser des identifiants anonymisés.
- Droit à l'effacement : prévoir une procédure d'anonymisation (ne pas supprimer les `Booking` et `Payment` pour des raisons comptables).

### Plafonds mobile money (BCEAO / Côte d'Ivoire)
- Orange Money / MTN / Moov / Wave : plafond par transaction et par mois variable selon l'opérateur.
- Vérifier les plafonds en vigueur avant chaque transaction et bloquer si dépassement.
- Conserver les logs de transactions pour le reporting BCEAO si requis.
- Ne pas stocker les numéros de téléphone mobile money en clair dans les logs.

---

## 22. Features spéciales

### Off-market
- `Venue.is_off_market = true` → l'espace n'apparaît pas dans la recherche publique.
- Accessible uniquement via `Venue.secret_link` (lien unique).
- Ne jamais exposer `secret_link` dans les réponses API publiques.

### Matching intelligent (v2)
- À la soumission d'une demande de devis, proposer 3–5 espaces pertinents.
- Notifier les propriétaires concernés.

### Pricing dynamique (v3)
- Multiplicateurs de prix selon saison, jour de la semaine, demande.
- Ne pas implémenter avant la v3.

---


---

## 23. Onboarding propriétaire

### Parcours d'activation

```
Inscription → Création espace → Soumission KYC → Validation admin → Publication
```

**Détail des étapes :**

| Étape | Action propriétaire | Action système | Statut espace |
|---|---|---|---|
| 1. Inscription | Crée un compte `owner` | Envoie email de confirmation | — |
| 2. Création espace | Remplit la fiche (photos, tarifs, équipements) | Sauvegarde en `status = pending` | `pending` |
| 3. Soumission KYC | Upload pièce d'identité + RIB | Notifie l'admin | `pending` |
| 4. Validation admin | — | Vérifie documents, passe à `validated` | `validated` |
| 5. Publication | Clique "Publier" | Passe à `published`, visible dans la recherche | `published` |

**Règles :**
- Le propriétaire peut créer et éditer son espace avant le KYC — il voit la valeur de la plateforme immédiatement.
- L'espace ne peut pas passer à `published` sans KYC complet (`Document.status = approved` pour tous les documents).
- Si le KYC est refusé (`rejected`), notifier le propriétaire avec le motif et lui permettre de resoumettre.
- Délai cible de validation admin : 48h ouvrées.

**Notifications :**
- Étape 1 : email de bienvenue + lien de confirmation
- Étape 3 : email "Documents reçus, validation sous 48h"
- Étape 4 validé : email "Votre espace est validé, vous pouvez le publier"
- Étape 4 refusé : email "Documents insuffisants" + motif
- Étape 5 : email "Votre espace est en ligne !"

---

## 24. Race condition — lock de créneau

### Problème
Deux clients peuvent tenter de locker le même créneau simultanément. Sans mécanisme atomique, les deux obtiennent confirmation → sur-réservation.

### Solution : Redis SETNX

```typescript
// Dans AvailabilityService.lockSlot()
const lockKey = `lock:availability:${availabilityId}`;
const lockValue = bookingId;
const ttlSeconds = BOOKING_LOCK_DURATION_MINUTES * 60;

// SETNX : atomique — un seul processus gagne
const acquired = await redis.set(lockKey, lockValue, {
  NX: true,        // Set if Not eXists
  EX: ttlSeconds,  // TTL automatique = expiration du lock
});

if (!acquired) {
  throw new Error('BOOKING_LOCK_EXPIRED'); // Créneau déjà locké
}

// Mettre à jour PostgreSQL en parallèle (source de vérité persistante)
await db.availability.update({
  where: { id: availabilityId },
  data: {
    locked_until: new Date(Date.now() + ttlSeconds * 1000),
    locked_by_user_id: userId,
    locked_booking_id: bookingId,
  },
});
```

**Libération du lock :**
```typescript
// À la fin du paiement (succès ou échec) ou expiration
await redis.del(`lock:availability:${availabilityId}`);
// Le TTL Redis libère automatiquement si le process plante
```

**Règles :**
- Redis est la **source de vérité** pour les locks actifs (lecture rapide).
- PostgreSQL est la **source de vérité** pour l'historique (audit, reporting).
- Si Redis est indisponible → fallback sur `SELECT FOR UPDATE` PostgreSQL (mode dégradé).
- Ne jamais vérifier la disponibilité depuis PostgreSQL seul en production — toujours Redis en premier.

---

## 25. Parcours devis → réservation (transitions complètes)

### Diagramme de transitions

```
[Client soumet devis]
       ↓
  Quote: pending
       ↓
  Propriétaire répond (max 48h)
   ↙           ↓           ↘
refused     accepted      countered
   ↓             ↓              ↓
notif       → Booking     Client répond (max 48h)
client        créé           ↙        ↘
                          accepted    refused/ignored
                             ↓              ↓
                       Lock démarre    Quote: expired
                       (15 min)
                             ↓
                       Client paie acompte
                             ↓
                       Booking: confirmed
```

### Règles de timing

| Transition | Délai max | Action si dépassé |
|---|---|---|
| Propriétaire répond au devis | 48h | `Quote.status = expired`, notif client |
| Client répond à une contre-offre | 48h | `Quote.status = expired`, créneau libéré |
| Client finalise le paiement après lock | 15 min | Lock libéré, `Booking.status = cancelled` |

### Règle de lock sur devis

- Le lock **ne démarre pas** à la soumission du devis.
- Le lock **ne démarre pas** quand le propriétaire fait une contre-offre.
- Le lock **démarre uniquement** quand le client confirme son acceptation (offre initiale ou contre-offre).
- Cela évite de bloquer le créneau pendant les phases de négociation.

### Création du Booking depuis un Quote

```typescript
// Quand Quote.status → accepted
const booking = await db.booking.create({
  data: {
    venue_id: quote.venue_id,
    user_id: quote.client_id,
    quote_id: quote.id,              // Lien traçable
    total_price: quote.proposed_price ?? quote.requested_price,
    status: 'locked',
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
    client_currency: quote.client_currency,
  },
});
await availabilityService.lockSlot(availabilityId, booking.id, userId);
```

---

## 26. Expérience mobile

### V1 : web responsive uniquement

- Pas de PWA ni d'app native en V1 — le web responsive couvre tous les cas d'usage.
- Le paiement mobile money CI se fait via navigateur mobile → pas besoin d'app.
- PWA activable en V2 : ajouter `manifest.json` + service worker (1–2 jours de dev).

### Breakpoints

| Breakpoint | Largeur | Cible |
|---|---|---|
| Mobile | < 768px | Téléphones (usage majoritaire CI) |
| Tablet | 768px – 1024px | Tablettes |
| Desktop | > 1024px | Ordinateurs |

### Comportements critiques sur mobile

**Recherche :**
- Carte masquée par défaut sur mobile → bouton "Voir la carte"
- Filtres dans un drawer/bottom sheet (pas un sidebar)

**Tunnel de réservation :**
- Étapes en plein écran successives (pas de formulaire multi-colonnes)
- Bouton CTA fixe en bas d'écran ("Réserver" / "Payer")
- Timer de lock visible en permanence (bandeau haut d'écran)

**Paiement mobile money (CI) :**
- Génération d'un lien de paiement → redirection vers l'opérateur
- Ou saisie du numéro de téléphone + confirmation par SMS/USSD
- Message d'attente explicite ("Confirmez le paiement sur votre téléphone")
- Timeout visible avec possibilité de relancer

**Messagerie :**
- Interface chat native (plein écran, clavier qui ne cache pas les messages)
- Upload de pièces jointes via galerie ou appareil photo

**Règles CSS :**
- Taille minimale des zones de tap : 44×44px
- Pas de hover-only interactions
- Formulaires : `font-size: 16px` minimum sur les inputs (évite le zoom auto iOS)

---

## 27. Matching intelligent (V1)

### Objectif
Quand un client soumet une demande de devis, proposer automatiquement 3–5 espaces pertinents et notifier les propriétaires concernés.

### Critères de matching (V1 — SQL pur)

```sql
SELECT v.*,
  ABS(v.capacity_seat - :requested_capacity) AS capacity_diff,
  ABS(v.base_price - :requested_budget) AS price_diff
FROM "Venue" v
WHERE
  v.city = :requested_city              -- Même ville (obligatoire)
  AND v.status = 'published'
  AND v.id != :original_venue_id        -- Exclure l'espace demandé
  AND v.capacity_seat BETWEEN           -- Capacité ±20%
      (:requested_capacity * 0.8) AND (:requested_capacity * 1.2)
  AND NOT EXISTS (                      -- Disponible à la date demandée
    SELECT 1 FROM "Availability" a
    WHERE a.venue_id = v.id
      AND a.date = :requested_date
      AND (a.blocked = true OR a.locked_until > NOW())
  )
ORDER BY
  capacity_diff ASC,                    -- Capacité la plus proche d'abord
  price_diff ASC,                       -- Puis prix le plus proche
  (SELECT AVG(score_overall)
   FROM "Review" r WHERE r.venue_id = v.id) DESC  -- Puis mieux noté
LIMIT 5;
```

### Déclenchement

- Au moment de la soumission d'un `Quote` → appel async (queue)
- Résultats stockés dans `Quote.suggested_venues JSONB` (liste d'IDs)
- Notification envoyée aux propriétaires des espaces suggérés

### Évolution V2
Remplacer le score de tri par un vrai algorithme de scoring (pondération configurable par l'admin : poids capacité, poids prix, poids note, poids taux de réponse propriétaire).

---

## 28. ⚠️ Archive — BullMQ (NE PAS IMPLÉMENTER en V1)

> **⚠️ Cette section est archivée.** BullMQ nécessite un processus persistant incompatible avec Vercel serverless. En V1, utiliser **Upstash QStash** (section 40). Cette section est conservée comme référence pour une future migration vers un serveur dédié (Phase 2+).

### Principe
Toutes les tâches non-bloquantes passent par BullMQ sur Redis. Une queue par domaine fonctionnel — même infrastructure, priorités et retry indépendants.

### Queues définies

| Queue | Jobs | Priorité | Retry | Délai max |
|---|---|---|---|---|
| `payments` | Callbacks PSP, payouts CI, remboursements | Critique | 5x (backoff exponentiel) | 30s |
| `notifications` | Emails transactionnels, notifs in-app | Haute | 3x | 60s |
| `bookings` | Expiration locks, expiration quotes | Haute | 3x | immédiat |
| `matching` | Suggestions espaces sur soumission devis | Normale | 2x | 5s |
| `analytics` | Enregistrement events tracking | Basse | 1x | 10s |

### Implémentation

```typescript
import { Queue, Worker, QueueScheduler } from 'bullmq';
import { redis } from './redis';

// Déclaration des queues
export const queues = {
  payments:      new Queue('payments',      { connection: redis }),
  notifications: new Queue('notifications', { connection: redis }),
  bookings:      new Queue('bookings',      { connection: redis }),
  matching:      new Queue('matching',      { connection: redis }),
  analytics:     new Queue('analytics',    { connection: redis }),
};

// Exemple : job de nettoyage des locks (répétable)
await queues.bookings.add(
  'cleanup-expired-locks',
  {},
  { repeat: { every: 60_000 } }  // toutes les minutes
);
```

### Worker — nettoyage des locks expirés

```typescript
new Worker('bookings', async (job) => {
  if (job.name !== 'cleanup-expired-locks') return;

  // 1. PostgreSQL : trouver les locks expirés
  const expired = await db.availability.findMany({
    where: { locked_until: { lt: new Date() }, locked_booking_id: { not: null } },
  });

  for (const slot of expired) {
    // 2. Annuler le booking
    await db.booking.update({
      where: { id: slot.locked_booking_id },
      data: { status: 'cancelled' },
    });
    // 3. Libérer le slot PostgreSQL
    await db.availability.update({
      where: { id: slot.id },
      data: { locked_until: null, locked_by_user_id: null, locked_booking_id: null },
    });
    // 4. Redis déjà libéré par TTL natif — rien à faire
    // 5. Tracker l'event
    await queues.analytics.add('track', {
      event_type: 'booking_cancelled',
      booking_id: slot.locked_booking_id,
    });
  }
}, { connection: redis });
```

### Règles

- Ne jamais appeler un PSP directement depuis un controller HTTP — toujours via la queue `payments`.
- La queue `analytics` est basse priorité et peut être vidée sans impact business si Redis sature.
- En cas de panne Redis → les jobs en cours sont perdus. Prévoir un job de réconciliation au redémarrage (scan des bookings `locked` dont `expires_at < NOW()`).

---

## 29. Taux de change EUR/XOF

### Décision V1 : taux fixe

Le franc CFA (XOF) est arrimé à l'euro par accord monétaire depuis 1999. Le taux est fixé par traité :

```
1 EUR = 655.957 FCFA (taux officiel immuable)
```

### Implémentation

```typescript
// config/currencies.ts
export const EXCHANGE_RATES: Record<string, number> = {
  'EUR_XOF': 655.957,
  'XOF_EUR': 1 / 655.957,
};

export function convert(amount: number, from: string, to: string): number {
  const key = `${from}_${to}`;
  const rate = EXCHANGE_RATES[key];
  if (!rate) throw new Error(`Unknown currency pair: ${key}`);
  return Math.round(amount * rate);  // Arrondi à l'entier (FCFA = pas de centimes)
}

// Exemple d'usage dans PaymentService
const amountXOF = convert(50, 'EUR', 'XOF'); // → 32 798 FCFA
```

### Stockage dans Payment

```typescript
await db.payment.create({
  data: {
    amount: 50,                    // Montant payé par le client
    currency: 'EUR',
    exchange_rate: 655.957,        // Toujours figé au moment de la transaction
    amount_converted: 32798,       // En FCFA
    commission_amount: 6,          // 12% de 50€
    commission_currency: 'EUR',
  }
});
```

### Règles

- Le taux est **figé au moment de la transaction** dans `Payment.exchange_rate` — jamais recalculé après.
- Les montants FCFA sont toujours des **entiers** (pas de centimes en XOF).
- Supprimer la variable d'env `EXCHANGE_RATE_API_KEY` — inutile en V1.
- Revue annuelle du taux prévue (même si aucun changement n'est attendu).
- Si le périmètre s'étend à d'autres devises (GHS, XAF, NGN…) → migrer vers une API (ExchangeRate-API free tier suffit).

---

## 30. Index PostGIS manquant

L'index spatial GIST est indispensable pour que les requêtes `ST_DWithin` soient performantes. Sans lui, PostgreSQL fait un full scan à chaque recherche géolocalisée.

### À ajouter à la migration initiale

```sql
-- Index spatial sur Venue.location (obligatoire pour ST_DWithin)
CREATE INDEX idx_venue_location ON "Venue" USING GIST (location);

-- Index complémentaires utiles
CREATE INDEX idx_venue_status ON "Venue" (status);
CREATE INDEX idx_venue_city ON "Venue" (city);
CREATE INDEX idx_availability_date ON "Availability" (venue_id, date);
CREATE INDEX idx_booking_status ON "Booking" (status);
CREATE INDEX idx_booking_user ON "Booking" (user_id);
CREATE INDEX idx_event_type ON "Event" (event_type, created_at);
CREATE INDEX idx_event_venue ON "Event" (venue_id, created_at);
```

### Mise à jour de `location` à chaque modification

```typescript
// Dans VenueService.update() — synchroniser location si lat/lng changent
if (data.latitude || data.longitude) {
  await db.$executeRaw`
    UPDATE "Venue"
    SET location = ST_MakePoint(${data.longitude}, ${data.latitude})::geography
    WHERE id = ${venueId}
  `;
}
```

### Requête de recherche géolocalisée complète

```sql
SELECT
  v.*,
  ST_Distance(v.location, ST_MakePoint(:lng, :lat)::geography) / 1000 AS distance_km
FROM "Venue" v
WHERE
  ST_DWithin(v.location, ST_MakePoint(:lng, :lat)::geography, :radius_meters)
  AND v.status = 'published'
  AND v.capacity_seat >= :min_capacity
ORDER BY distance_km ASC
LIMIT 20;
```

---

## 31. PSP mobile money CI — choix et intégration

### Décision : CinetPay

CinetPay agrège Orange Money, MTN, Moov et Wave en un seul contrat et une seule API. Évite de gérer 4 intégrations séparées.

### Variables d'environnement à ajouter

```
CINETPAY_API_KEY
CINETPAY_SITE_ID
CINETPAY_NOTIFY_URL       # URL de callback webhook
CINETPAY_RETURN_URL       # Redirect après paiement
```

### Flux de paiement CinetPay

```
1. Noscoins → CinetPay : initie le paiement (montant, téléphone, référence)
2. CinetPay → Client : demande de confirmation (Orange/MTN/Moov/Wave)
3. Client confirme sur son téléphone
4. CinetPay → Noscoins : webhook de confirmation (CINETPAY_NOTIFY_URL)
5. Noscoins vérifie la signature du webhook
6. Noscoins met à jour : Payment.status = succeeded, Booking.status = confirmed
```

### Implémentation webhook

```typescript
// POST /webhooks/cinetpay
async handleCinetpayWebhook(payload: CinetpayWebhook) {
  // 1. Vérifier la signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CINETPAY_API_KEY)
    .update(payload.cpm_trans_id + payload.cpm_amount)
    .digest('hex');

  if (payload.signature !== expectedSignature) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  // 2. Vérifier le statut
  if (payload.cpm_result !== '00') {
    await this.handlePaymentFailure(payload.cpm_trans_id);
    return;
  }

  // 3. Mettre à jour via la queue (jamais directement depuis le webhook)
  await queues.payments.add('confirm-payment', {
    psp_reference: payload.cpm_trans_id,
    amount: payload.cpm_amount,
    currency: 'XOF',
  });
}
```

### Plafonds CinetPay à respecter (BCEAO)

| Opérateur | Plafond par transaction | Plafond mensuel |
|---|---|---|
| Orange Money CI | 1 000 000 FCFA | 5 000 000 FCFA |
| MTN CI | 1 000 000 FCFA | 5 000 000 FCFA |
| Moov CI | 500 000 FCFA | 3 000 000 FCFA |
| Wave CI | 2 000 000 FCFA | 10 000 000 FCFA |

- Vérifier le montant avant d'initier le paiement — bloquer si dépassement avec message explicite.
- Ces plafonds peuvent changer — les vérifier trimestriellement sur le site BCEAO.

---

## 32. Stratégie d'acquisition espaces (V1)

### Problème bootstrap
Sans espaces qualifiés au lancement, la plateforme ne démarre pas. C'est le risque business numéro 1 des marketplaces : pas d'offre → pas de demande → pas d'offre.

### Leviers V1 (0–6 mois)

#### 1. Agents terrain — Côte d'Ivoire (priorité absolue)
- Recruter 2–3 agents terrain à Abidjan
- Mission : identifier, convaincre et onboarder les propriétaires en face à face
- Le marché CI est relationnel — un appel ne suffit pas, il faut une présence physique
- Objectif : 20–30 espaces activés à Abidjan dans les 60 premiers jours
- Rémunération recommandée : fixe + prime par espace publié (ex : 5 000–10 000 FCFA par espace validé)

#### 2. Prospection directe — Paris
- Prospection LinkedIn + appels + visites des lieux événementiels
- Cible : salles de réception, lofts, rooftops, espaces atypiques (plus faciles à convaincre que les grands hôtels)
- Objectif : 15–20 espaces à Paris dans les 90 premiers jours
- Approche : démonstration live de la plateforme + promesse de visibilité

#### 3. Incentive de lancement : 0% commission pendant 3 mois
- Offrir 0% de commission sur les 3 premiers mois pour tout espace inscrit avant une date limite
- Argument fort pour lever les objections des propriétaires hésitants
- **Implémentation :** ajouter `Venue.commission_override NUMERIC` et `Venue.commission_override_until TIMESTAMP`
- Le `PaymentService` vérifie ce champ avant d'appliquer le taux standard

```sql
ALTER TABLE "Venue"
  ADD COLUMN commission_override NUMERIC,
  ADD COLUMN commission_override_until TIMESTAMP;
```

```typescript
// Dans PaymentService.calculateCommission()
const rate = (venue.commission_override !== null
  && venue.commission_override_until > new Date())
  ? venue.commission_override      // 0% pendant la période promo
  : config.commission_rate_default; // 12% sinon
```

### Objectifs V1

| Marché | Objectif 60j | Objectif 90j |
|---|---|---|
| Abidjan | 20 espaces publiés | 40 espaces publiés |
| Paris | 10 espaces publiés | 20 espaces publiés |
| Total | 30 espaces | 60 espaces |

### Ce qu'on ne fait PAS en V1
- SEO (résultats trop lents, minimum 6 mois)
- Contenu réseaux sociaux (effort sans ROI direct au démarrage)
- Partenariats agences événementielles (vient en Phase 2 une fois la plateforme prouvée)

---

## 33. Modèle d'abonnement propriétaire (Phase 2)

### Principe
Offrir une version gratuite fonctionnelle + une version Premium qui amplifie la visibilité et les revenus du propriétaire.

### Tiers

| Feature | Gratuit | Premium (20–50€/mois) |
|---|---|---|
| Publier des espaces | Illimité | Illimité |
| Répondre aux devis | Oui | Oui |
| Stats de base (vues, réservations) | Oui | Oui |
| **Stats avancées** | Non | **Oui** |
| **Badge "Espace vérifié Premium"** | Non | **Oui** |
| **Priorité dans les résultats** | Non | **Oui** |
| **Support prioritaire** | Non | **Oui** |
| Off-market (lien secret) | Oui | Oui |

### Stats avancées (détail)
- Taux d'occupation par période
- Revenus prévisionnels (basés sur les réservations confirmées)
- Comparaison avec la moyenne des espaces similaires
- Taux de conversion devis → réservation
- Analyse des sources de trafic (recherche, off-market, direct)

### Badge "Espace vérifié Premium"
- Affiché sur la carte et dans les résultats de recherche
- Critères : KYC validé + abonnement actif + note ≥ 4/5 + ≥ 3 réservations complétées
- Impact attendu : +15–25% de taux de clic (benchmark Airbnb/Booking sur les badges)

### Priorité dans les résultats
- Les espaces Premium apparaissent en premier à égalité de score de pertinence
- Pas de "surclassement" abusif — uniquement en cas d'égalité avec un espace non-premium
- Maximum 2 espaces Premium en tête de liste pour préserver la confiance

### Implémentation BDD

```sql
ALTER TABLE "User"
  ADD COLUMN subscription_tier VARCHAR(20)
    CHECK (subscription_tier IN ('free', 'premium'))
    DEFAULT 'free',
  ADD COLUMN subscription_expires_at TIMESTAMP;
```

### Ajout à Config

| Clé | Valeur par défaut |
|---|---|
| `premium_price_eur` | `29` |
| `premium_price_xof` | `19000` |
| `premium_trial_days` | `14` |

---

## 34. Commission et marge nette par marché

### Décision V1 : 12% partout
Commission uniforme sur les deux marchés pour la simplicité du code, de la communication et de la facturation.

### Analyse de marge nette réelle

| | Europe (Stripe) | Côte d'Ivoire (CinetPay) |
|---|---|---|
| Commission brute | 12% | 12% |
| Frais PSP estimés | ~1.5% + 0.25€ | ~2.5–3% |
| **Marge nette plateforme** | **~10.5%** | **~9–9.5%** |
| Frais de service (fixes) | 50€ | 10 000 FCFA (~15€) |

- La marge CI est légèrement inférieure mais acceptable en V1.
- Les frais de service fixes compensent partiellement sur les petites réservations.

### Revue prévue en Phase 2
Quand les données réelles de coût PSP seront disponibles (après 3–6 mois), évaluer si une différenciation s'impose :
- Option A : 10% CI / 12% EU (compense les frais PSP)
- Option B : Augmenter les frais de service CI (15 000 FCFA au lieu de 10 000)
- Option C : Maintenir 12% partout si la marge reste acceptable

**Documenter dans `Config` pour faciliter la modification future :**
```
commission_rate_eu = 0.12
commission_rate_ci = 0.12  ← à réviser en Phase 2 si besoin
```

---

## 35. Frais de service — levier de marge

### Rôle stratégique
Les frais de service sont **non remboursables en toute circonstance**. Ils garantissent une marge minimale même sur les petites réservations ou les annulations.

### Calcul d'impact

| Scénario | Sans frais | Avec frais |
|---|---|---|
| Résa 500€ annulée > 30j | 0€ de revenu | 50€ garantis |
| Résa 200 000 FCFA annulée > 30j | 0 FCFA | 10 000 FCFA garantis |
| Résa 300€ complétée | 36€ (12%) | 86€ (12% + 50€) |

### Affichage obligatoire
Les frais de service doivent être affichés **explicitement** dans le tunnel de réservation, avant le paiement :

```
Sous-total espace    450 €
Services inclus       50 €
─────────────────────────
Acompte (30%)        150 €
Frais de service      50 €  ← non remboursables
─────────────────────────
Total dû maintenant  200 €
```

- Ne pas les masquer dans le prix total — risque de litige et mauvaise UX.
- Mention légale obligatoire : "Les frais de service ne sont pas remboursables en cas d'annulation."

### Règle d'implémentation
- Les frais de service sont prélevés **au moment de l'acompte**, avec la commission.
- Ils ne font **pas** partie de `Booking.total_price` (prix du lieu + services).
- Créer un champ dédié : `Booking.service_fee_amount` et `Booking.service_fee_currency`.

```sql
-- service_fee_amount et service_fee_currency déjà dans le CREATE TABLE (section 8)
-- ALTER uniquement si migration sur base existante :
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS service_fee_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS service_fee_currency TEXT;
```

---

## 36. Diagrammes de séquence paiement

### Flux Stripe Connect (Europe)

```
Client          Noscoins API       Stripe          Propriétaire
  │                  │                │                  │
  │─── POST /bookings/start ─────────▶│                  │
  │                  │─── Lock créneau (Redis SETNX) ───▶│
  │                  │◀── Lock OK ────────────────────────│
  │◀── { booking_id, expires_at } ───│                  │
  │                  │                │                  │
  │─── POST /payments/initiate ──────▶│                  │
  │                  │─── Create PaymentIntent ─────────▶│
  │                  │◀── { client_secret } ─────────────│
  │◀── { client_secret, amount } ────│                  │
  │                  │                │                  │
  │─── Stripe Checkout (front) ──────────────────────────▶│
  │◀── Confirmation 3DS si requis ──────────────────────│
  │                  │                │                  │
  │                  │◀── Webhook: payment_intent.succeeded
  │                  │    (vérification signature)        │
  │                  │─── Booking.status = confirmed ────▶│
  │                  │─── Commission prélevée (12%) ─────▶│
  │                  │─── Virement net → compte connecté ▶│
  │                  │─── Notification client + owner ───▶│
  │◀── Email confirmation ──────────│                  │
```

**Règles critiques :**
- Ne jamais confirmer depuis le front-end — attendre uniquement le webhook.
- Vérifier `stripe-signature` avant tout traitement.
- Si webhook reçu mais `booking` introuvable → log + ignore (idempotence).
- Si webhook reçu deux fois (retry Stripe) → vérifier `Payment.psp_reference` avant de retraiter.

### Flux CinetPay (Côte d'Ivoire)

```
Client          Noscoins API      CinetPay        Téléphone client
  │                  │                │                  │
  │─── POST /bookings/start ─────────▶│                  │
  │                  │─── Lock créneau (Redis SETNX) ───▶│
  │◀── { booking_id, expires_at } ───│                  │
  │                  │                │                  │
  │─── POST /payments/initiate ──────▶│                  │
  │                  │─── Init paiement (montant, tel) ─▶│
  │                  │◀── { payment_url, trans_id } ─────│
  │◀── { payment_url } ─────────────│                  │
  │                  │                │                  │
  │─── Redirigé vers CinetPay ───────────────────────────▶│
  │                  │                │─── Demande USSD/SMS ─▶│
  │                  │                │◀── Confirmation ──────│
  │                  │                │                  │
  │                  │◀── Webhook: paiement confirmé ────│
  │                  │    (vérification signature HMAC)   │
  │                  │─── Queue payments: confirm-payment▶│
  │                  │─── Booking.status = confirmed ────▶│
  │                  │─── Crédit Wallet propriétaire ────▶│
  │                  │─── Notification client + owner ───▶│
  │◀── Email / SMS confirmation ────│                  │
```

**Spécificités CI :**
- Le paiement est **asynchrone** — le client quitte le navigateur pendant la confirmation USSD.
- Afficher un écran d'attente avec polling `/payments/status/:trans_id` toutes les 5s.
- Timeout côté client : 10 minutes (le lock expire à 15 min — marge de 5 min).
- Si CinetPay ne rappelle pas en 15 min → lock libéré automatiquement, paiement à rejeter si webhook tardif.

---

## 37. Seed de données de démo

### Objectif
Permettre à tout nouveau dev de tester immédiatement la plateforme sans créer de données manuellement.

### Données à générer (`prisma/seed.ts`)

```typescript
// apps/api/prisma/seed.ts

const seed = async () => {

  // ── USERS ──────────────────────────────────────────────
  const admin = await prisma.user.create({ data: {
    type: 'admin', email: 'admin@noscoins.com',
    phone: '+33600000001', country_code: 'FR',
    account_status: 'active',
  }});

  const ownerParis = await prisma.user.create({ data: {
    type: 'owner', email: 'owner.paris@noscoins.com',
    phone: '+33600000002', country_code: 'FR',
    account_status: 'active',
  }});

  const ownerAbidjan = await prisma.user.create({ data: {
    type: 'owner', email: 'owner.abidjan@noscoins.com',
    phone: '+2250700000001', country_code: 'CI',
    account_status: 'active',
  }});

  const client = await prisma.user.create({ data: {
    type: 'client', email: 'client@noscoins.com',
    phone: '+33600000003', country_code: 'FR',
    account_status: 'active',
  }});

  // ── VENUES ─────────────────────────────────────────────
  const venueParis = await prisma.venue.create({ data: {
    owner_id: ownerParis.id,
    name: 'Loft Marais',
    city: 'Paris', address: '12 rue de Bretagne, 75003 Paris',
    latitude: 48.8637, longitude: 2.3590,
    capacity_seat: 80, capacity_stand: 120,
    base_price: 1200, currency: 'EUR',
    status: 'published', booking_mode: 'instant',
    balance_due_days_before: 30,
  }});

  const venueAbidjan = await prisma.venue.create({ data: {
    owner_id: ownerAbidjan.id,
    name: 'Villa Cocody',
    city: 'Abidjan', address: 'Cocody Riviera, Abidjan',
    latitude: 5.3600, longitude: -3.9800,
    capacity_seat: 200, capacity_stand: 350,
    base_price: 350000, currency: 'XOF',
    status: 'published', booking_mode: 'request',
    balance_due_days_before: 14,
  }});

  // ── SERVICES ───────────────────────────────────────────
  await prisma.service.createMany({ data: [
    { venue_id: venueParis.id, name: 'Sono + éclairage',
      price: 300, currency: 'EUR', type: 'optional', category: 'music' },
    { venue_id: venueParis.id, name: 'Agent de sécurité',
      price: 150, currency: 'EUR', type: 'mandatory', category: 'security' },
    { venue_id: venueAbidjan.id, name: 'Traiteur buffet',
      price: 50000, currency: 'XOF', type: 'optional', category: 'catering' },
  ]});

  // ── AVAILABILITY ───────────────────────────────────────
  // Générer 30 jours de disponibilité pour chaque espace
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    await prisma.availability.createMany({ data: [
      { venue_id: venueParis.id, date, start_time: '09:00', end_time: '23:00' },
      { venue_id: venueAbidjan.id, date, start_time: '08:00', end_time: '23:00' },
    ]});
  }

  // ── BOOKING (confirmé) ─────────────────────────────────
  const booking = await prisma.booking.create({ data: {
    venue_id: venueParis.id, user_id: client.id,
    status: 'paid',
    total_price: 1500, deposit_amount: 450,
    service_fee_amount: 50, service_fee_currency: 'EUR',
    client_currency: 'EUR', owner_currency: 'EUR',
  }});

  // ── QUOTE (en attente) ─────────────────────────────────
  await prisma.quote.create({ data: {
    venue_id: venueAbidjan.id, client_id: client.id,
    status: 'pending',
    requested_date: new Date(today.setDate(today.getDate() + 45)),
    proposed_price: 350000,
    message: 'Bonjour, je souhaite réserver pour un mariage de 180 personnes.',
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
  }});

  // ── CONFIG ─────────────────────────────────────────────
  await prisma.config.createMany({ data: [
    { key: 'commission_rate_eu',              value: '0.12' },
    { key: 'commission_rate_ci',              value: '0.12' },
    { key: 'booking_lock_minutes',            value: '15' },
    { key: 'service_fee_eur',                 value: '50' },
    { key: 'service_fee_xof',                 value: '10000' },
    { key: 'owner_cancellation_penalty_rate', value: '0.30' },
    { key: 'quote_expiry_hours',              value: '48' },
    { key: 'request_booking_expiry_hours',    value: '48' },
    { key: 'premium_price_eur',               value: '29' },
    { key: 'premium_price_xof',               value: '19000' },
    { key: 'premium_trial_days',              value: '14' },
  ]});

  console.log('Seed terminé : 4 users, 2 venues, 3 services, 60 créneaux, 1 booking, 1 quote, 11 configs');
};

seed().catch(console.error).finally(() => prisma.$disconnect());
```

### Comptes de test

| Rôle | Email | Usage |
|---|---|---|
| Admin | `admin@noscoins.com` | Valider espaces, gérer Config |
| Propriétaire Paris | `owner.paris@noscoins.com` | Loft Marais, mode instant |
| Propriétaire Abidjan | `owner.abidjan@noscoins.com` | Villa Cocody, mode request |
| Client | `client@noscoins.com` | Réservation payée + devis en attente |

---

## 38. Domaine & déploiement Vercel

### Domaine
- **Domaine acheté** : `noscoins.app` (sur Vercel)
- **URLs de production** :
  - App : `https://noscoins.app`
  - API : `https://noscoins.app/api/*`
  - Webhooks Stripe : `https://noscoins.app/api/webhooks/stripe`
  - Webhooks CinetPay : `https://noscoins.app/api/webhooks/cinetpay`
  - Webhooks QStash : `https://noscoins.app/api/webhooks/qstash`

### Configuration Vercel
```json
// vercel.json
{
  "functions": {
    "app/api/webhooks/stripe/route": { "maxDuration": 30 },
    "app/api/webhooks/cinetpay/route": { "maxDuration": 30 },
    "app/api/webhooks/qstash/route": { "maxDuration": 30 },
    "app/api/payments/route": { "maxDuration": 30 },
    "app/api/notifications/stream/route": { "maxDuration": 60 }
  }
}
```

| Endpoint | maxDuration | Raison |
|---|---|---|
| Webhooks (Stripe, CinetPay, QStash) | 30s | Traitement async + appels DB |
| Paiements | 30s | Appels PSP externes |
| SSE `/notifications/stream` | 60s | Connexion persistante (max Hobby) |
| Tous les autres | 10s (défaut) | Requêtes standard |

> **Limite Vercel Hobby :** 60s maximum. Ne pas dépasser — passer à Pro (20$/mois) si nécessaire.

### Branches & déploiements
| Branche | Environnement | URL |
|---|---|---|
| `main` | Production | `noscoins.app` |
| `develop` | Preview | `noscoins-git-develop.vercel.app` |
| PR | Preview | `noscoins-git-pr-N.vercel.app` |

### Variables d'environnement Vercel
Configurer dans **Vercel Dashboard → Project → Settings → Environment Variables** :
- `Production` : valeurs réelles
- `Preview` : valeurs de staging (Supabase projet séparé si possible)
- `Development` : via `.env.local` uniquement

---

## 39. SEO & performance

### Pages avec SSR obligatoire (pour le SEO)
Les fiches espaces et les résultats de recherche doivent être indexables par Google.

```typescript
// app/(public)/venues/[id]/page.tsx
export async function generateMetadata({ params }) {
  const venue = await getVenue(params.id);
  return {
    title: `${venue.name} — ${venue.city} | Noscoins`,
    description: `Réservez ${venue.name} à ${venue.city}. Capacité ${venue.capacity_seat} pers. À partir de ${venue.base_price}€.`,
    openGraph: {
      title: `${venue.name} | Noscoins`,
      images: [venue.photos[0]?.url],
    },
  };
}
```

### Sitemap dynamique
```typescript
// app/sitemap.ts
export default async function sitemap() {
  const venues = await prisma.venue.findMany({
    where: { status: 'published' },
    select: { id: true, updatedAt: true },
  });

  return [
    { url: 'https://noscoins.app', lastModified: new Date() },
    { url: 'https://noscoins.app/search', lastModified: new Date() },
    ...venues.map(v => ({
      url: `https://noscoins.app/venues/${v.id}`,
      lastModified: v.updatedAt,
    })),
  ];
}
```

### robots.txt
```
// public/robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /client/
Disallow: /owner/
Disallow: /api/

Sitemap: https://noscoins.app/sitemap.xml
```

### Performance Vercel (Hobby)
- Images : utiliser `next/image` avec Cloudinary comme `loader` — optimisation automatique
- Fonts : Playfair Display + Inter via `next/font/google` — chargement optimisé, pas de FOUT
- Bundle : activer `@next/bundle-analyzer` pour surveiller la taille

---

## 40. Architecture QStash (queue serverless)

BullMQ nécessite un processus persistant — incompatible avec Vercel serverless.
**Upstash QStash** remplace BullMQ : il appelle des endpoints HTTP au lieu de workers persistants.

### Principe

```
Noscoins API ──── QStash ────▶ /api/webhooks/qstash ──── Job exécuté
   (publish)       (schedule)       (receiver)
```

### Implémentation

```typescript
// lib/qstash.ts
import { Client, Receiver } from '@upstash/qstash';

export const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// Publier un job
export async function enqueue(job: string, payload: object, delaySeconds = 0) {
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/qstash`,
    body: { job, payload },
    delay: delaySeconds,
  });
}
```

```typescript
// app/api/webhooks/qstash/route.ts
import { receiver } from '@/lib/qstash';

export async function POST(req: Request) {
  // 1. Vérifier la signature QStash
  const body = await req.text();
  const isValid = await receiver.verify({
    signature: req.headers.get('upstash-signature')!,
    body,
  });
  if (!isValid) return new Response('Unauthorized', { status: 401 });

  const { job, payload } = JSON.parse(body);

  // 2. Router vers le bon handler
  switch (job) {
    case 'cleanup-expired-locks':  return handleCleanupLocks();
    case 'send-notification':      return handleNotification(payload);
    case 'confirm-payment':        return handlePaymentConfirm(payload);
    case 'run-matching':           return handleMatching(payload);
    case 'track-event':            return handleAnalytics(payload);
    default: return new Response('Unknown job', { status: 400 });
  }
}
```

### Jobs et déclencheurs

| Job | Déclencheur | Délai |
|---|---|---|
| `cleanup-expired-locks` | QStash CRON toutes les minutes | — |
| `send-notification` | À chaque événement métier | 0s |
| `confirm-payment` | Webhook Stripe / CinetPay reçu | 0s |
| `run-matching` | Soumission d'un devis | 0s |
| `track-event` | Chaque action utilisateur | 0s |

### CRON QStash pour le nettoyage des locks
Configurer dans le dashboard Upstash QStash :
```
URL      : https://noscoins.app/api/webhooks/qstash
CRON     : * * * * *   (toutes les minutes)
Body     : {"job": "cleanup-expired-locks", "payload": {}}
```

---

## 41. Configuration Prisma + Supabase (critique)

### Problème : pool de connexions sur Vercel serverless

Chaque invocation d'une Route Handler Vercel crée une nouvelle instance JS.
Sans singleton, chaque requête instancie un nouveau `PrismaClient` → saturation du pool Supabase en quelques minutes.

### Pattern singleton obligatoire

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Règle :** toujours importer `prisma` depuis `@/lib/prisma` — jamais `new PrismaClient()` directement.

### Configuration schema.prisma pour Supabase

Supabase expose deux URLs :
- `DATABASE_URL` → via **PgBouncer** (pooler) — pour les requêtes applicatives
- `DIRECT_URL` → connexion directe — pour les migrations Prisma uniquement

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // PgBouncer — requêtes app
  directUrl = env("DIRECT_URL")     // Connexion directe — migrations
}
```

```bash
# .env.local
# Récupérer ces URLs dans Supabase → Settings → Database → Connection string

# PgBouncer (port 6543) — pour l'app
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connexion directe (port 5432) — pour les migrations
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
```

### Activer PostGIS sur Supabase

PostGIS ne s'active **pas** via `CREATE EXTENSION` dans les migrations Prisma — il faut l'activer via le dashboard Supabase :

1. Aller dans **Supabase Dashboard → Database → Extensions**
2. Rechercher `postgis`
3. Cliquer **Enable**

Ensuite seulement, les colonnes `GEOGRAPHY` et les fonctions `ST_*` fonctionneront.

```typescript
// Vérifier que PostGIS est actif au démarrage (lib/db-check.ts)
export async function checkPostGIS() {
  const result = await prisma.$queryRaw`
    SELECT COUNT(*) FROM pg_extension WHERE extname = 'postgis'
  `;
  if (!result[0].count) {
    throw new Error('PostGIS non activé — activer via Supabase Dashboard');
  }
}
```

### Server-Sent Events (SSE) — notifications in-app

Les WebSockets persistent ne fonctionnent pas sur Vercel. Utiliser SSE :

```typescript
// app/api/notifications/stream/route.ts
export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Envoyer les notifications non lues au démarrage
      const notifications = await prisma.notification.findMany({
        where: { user_id: userId, read_at: null },
        orderBy: { created_at: 'desc' },
      });

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(notifications)}

`)
      );

      // Polling toutes les 10s (SSE côté serveur)
      const interval = setInterval(async () => {
        const newNotifs = await prisma.notification.findMany({
          where: { user_id: userId, read_at: null, created_at: { gt: lastCheck } },
        });
        if (newNotifs.length > 0) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(newNotifs)}

`)
          );
        }
      }, 10_000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Limite Vercel Hobby :** les fonctions serverless ont un timeout de 10s par défaut.
Pour le SSE, configurer `maxDuration: 60` dans `vercel.json` pour l'endpoint stream.

### Authentification JWT custom (pas NextAuth)

NextAuth est trop générique pour les besoins de Noscoins (3 rôles, refresh tokens, sessions).
Utiliser JWT custom via `jose` (compatible Edge Runtime Vercel) :

```typescript
// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signAccessToken(userId: string, role: string) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(secret);
}

export async function signRefreshToken(userId: string) {
  return new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: string; role: string };
}
```

### Stockage des tokens — cookie HttpOnly (obligatoire)

**Ne jamais stocker les tokens dans `localStorage`** — vulnérable aux attaques XSS.
Utiliser des **cookies HttpOnly** : inaccessibles depuis JavaScript, envoyés automatiquement par le navigateur.

```typescript
// app/api/auth/login/route.ts
export async function POST(req: Request) {
  // ... vérification des credentials ...
  const accessToken = await signAccessToken(user.id, user.type);
  const refreshToken = await signRefreshToken(user.id);

  const res = NextResponse.json({ success: true });

  // Access token : cookie HttpOnly, SameSite=Strict, Secure
  res.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60,           // 15 minutes
    path: '/',
  });

  // Refresh token : même config, durée plus longue
  res.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,  // 7 jours
    path: '/api/auth/refresh',  // Accessible uniquement sur cette route
  });

  return res;
}
```

**Lecture dans le middleware :**
```typescript
// middleware.ts — lire depuis les cookies, pas les headers Authorization
const token = req.cookies.get('access_token')?.value;
```

**Middleware Next.js pour la protection des routes :**
```typescript
// middleware.ts
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function middleware(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.redirect('/login');

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect('/login');
  }
}

export const config = {
  matcher: ['/client/:path*', '/owner/:path*', '/admin/:path*'],
};
```

---

## 42. Points de vigilance

- **Webhook Stripe** : toujours vérifier la signature (`stripe-signature` header) avant de traiter.
- **Lock expiration** : le job de nettoyage doit tourner toutes les minutes en production.
- **secret_link** : ne jamais logger ni exposer dans les réponses publiques.
- **Taux de change** : toujours figer au moment de la transaction, jamais en différé.
- **Commission** : toujours lire depuis `Config`, ne jamais hardcoder.
- **RGPD** : `Event.properties` ne doit pas contenir de données personnelles identifiables.
- **KYC propriétaire** : `Venue.status` ne peut pas passer à `published` sans tous les `Document.status = approved`.
- **Avis** : ne jamais autoriser un avis si `Booking.status ≠ completed`.
- **Messagerie** : vérifier que `sender_id` est bien partie prenante de la réservation avant envoi.
- **Remboursement** : toujours vérifier le délai avant l'événement côté serveur, jamais côté client.
- **Pénalité propriétaire** : ne pas bloquer le remboursement client en attendant le recouvrement de la pénalité.
- **Venue suspendue** : bloquer toute nouvelle réservation, ne pas annuler les réservations existantes automatiquement.
- **Mode `request`** : ne jamais déclencher le paiement avant acceptation explicite du propriétaire.
- **Config** : toute modification de `Config` doit être loggée dans `AuditLog`.
