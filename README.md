# GetSalons Pakistan 💇‍♀️✨

**Pakistan's salon discovery & appointment booking marketplace** — a production-ready, SEO-optimized Booksy-style platform built with Next.js 15, React 19, TypeScript, Tailwind CSS 4 and MongoDB.

Customers discover salons, compare prices, read **verified reviews** and book appointments online. Salon owners get a full business dashboard: bookings, staff, services, gallery, working hours and reviews. Admins moderate the marketplace.

---

## ✨ Feature Highlights

| Area | Features |
|---|---|
| **Discovery** | City/area/category/service search, filters (price, rating, gender, home service, open now), sorting, pagination |
| **Salon profiles** | SEO URLs (`/salon/royal-beauty-salon-lahore`), gallery, services & prices, team, hours, Google Maps, WhatsApp/call buttons, FAQs, policies |
| **Booking engine** | 4-step wizard (service → specialist → slot → confirm), real-time availability, double-booking prevention (overlap check + unique DB index backstop), reschedule/cancel, booking statuses (pending → confirmed → completed / cancelled / no-show) |
| **Reviews** | Verified-only (must complete a booking), star ratings, owner replies, helpful votes, reporting, automatic rating aggregation |
| **Customer dashboard** | Upcoming/past bookings, favourites (wishlist), my reviews, profile settings |
| **Salon dashboard** | Overview stats (revenue, pending, rating, views), booking management, services CRUD, staff & leave management, working hours, gallery uploads, profile settings |
| **Admin console** | Salon approval workflow (approve/reject/suspend/feature), user management, cities & categories, platform analytics, audit logs |
| **Notifications** | In-app + email (Nodemailer) + WhatsApp-ready adapter architecture |
| **SEO** | Dynamic metadata, canonical URLs, Open Graph/Twitter cards, JSON-LD (BeautySalon, FAQ, Breadcrumb, Article, Organization, WebSite + SearchAction), dynamic `sitemap.xml`, `robots.txt` |
| **UI/UX** | Black & gold luxury branding, dark/light mode, glassmorphism, Framer Motion animations, fully responsive, accessible |
| **Security** | bcrypt hashing, Zod validation everywhere, role-based middleware, rate limiting, input sanitization, security headers |

---

## 🧱 Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components) + React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4, Framer Motion, lucide-react icons
- **Database:** MongoDB + Mongoose 8 (15 models, indexed)
- **Auth:** NextAuth/Auth.js v5 (JWT sessions, credentials + Google-ready), 4 roles
- **Forms/Validation:** React Hook Form + Zod (shared client/server schemas)
- **Uploads:** Cloudinary
- **Email:** Nodemailer (SMTP)
- **Deploy:** Vercel-ready

## 📁 Project Structure — clean frontend/backend separation

```
getsalons/
├── scripts/
│   └── seed.ts                  # Sample-data seeder (npm run seed)
├── src/
│   ├── middleware.ts            # Role-based route protection (edge)
│   │
│   ├── server/                  # ⬅ BACKEND (never imported by client code)
│   │   ├── db.ts                # Cached Mongoose connection
│   │   ├── api-helpers.ts       # ok/fail responses, guards, rate limiter
│   │   ├── auth/                # NextAuth v5 (edge-safe config + node impl)
│   │   ├── models/              # 15 Mongoose models + barrel export
│   │   └── services/            # Business logic layer
│   │       ├── booking.service.ts    # Availability engine + booking lifecycle
│   │       ├── salon.service.ts      # Search, CRUD, moderation
│   │       ├── review.service.ts     # Verified reviews + rating aggregation
│   │       ├── notification.service.ts
│   │       ├── email.ts / whatsapp.ts / upload.service.ts
│   │
│   ├── app/                     # ⬅ ROUTES
│   │   ├── api/                 # REST API (thin controllers over services)
│   │   ├── (public pages)       # / , /salons , /salon/[slug] , /book/[slug],
│   │   │                        # /partner , /blog , /login , /register
│   │   ├── dashboard/           # Customer dashboard
│   │   ├── salon-dashboard/     # Owner/staff dashboard
│   │   ├── admin/               # Admin console
│   │   ├── sitemap.ts robots.ts # SEO
│   │
│   ├── components/              # ⬅ FRONTEND
│   │   ├── ui/                  # Design system primitives
│   │   ├── layout/ home/ salons/ booking/ auth/ partner/ dashboard/ seo/
│   │
│   ├── lib/                     # Shared (client-safe) utils
│   │   ├── utils.ts constants.ts seo.ts api.ts
│   │   └── validations/         # Zod schemas (used by both sides)
│   ├── hooks/
│   └── types/                   # Shared domain types
```

**The rule:** `src/server/**` is backend-only. UI components never import from it; server components and API routes are the only bridge. Zod schemas in `src/lib/validations` are shared so the client and server always validate identically.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.18+ (tested on Node 24)
- MongoDB — local (`mongodb://127.0.0.1:27017/getsalons`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 2. Install & configure

```bash
npm install
copy .env.example .env      # Windows  (cp on macOS/Linux)
```

Edit `.env` — the two required values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/getsalons
AUTH_SECRET=<run: openssl rand -base64 32>
```

Optional integrations (app degrades gracefully without them):
- **Cloudinary** → enables image uploads (gallery)
- **SMTP** → enables booking-confirmation emails (otherwise logged to console)
- **Google OAuth** → enables Google login automatically when set

### 3. Seed sample data

```bash
npm run seed
```

Loads 6 cities, 10 categories, 8 approved salons (services, staff, galleries), verified reviews, blog articles and demo accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@getsalons.pk` | `Admin@12345` |
| **Salon owner** | `sana.owner@getsalons.pk` | `Password123!` |
| **Customer** | `ayesha@example.com` | `Password123!` |

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # strict TS check
npm run build      # production build
```

---

## 🔌 API Overview

All routes return `{ success, data?, message?, errors?, pagination? }`.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account (customer/owner) |
| GET | `/api/salons` | – | Search with filters/sort/pagination |
| POST | `/api/salons` | user | Submit salon (→ pending approval) |
| GET/PATCH | `/api/salons/:id` | owner | Read/update own salon |
| PATCH | `/api/salons/:id/moderate` | admin | approve / reject / suspend / feature |
| POST/DELETE | `/api/salons/:id/gallery` | owner | Manage gallery |
| GET | `/api/bookings/availability` | – | Free slots for service+date(+staff) |
| POST | `/api/bookings` | user | Create booking (race-safe) |
| GET | `/api/bookings` | user | Role-aware list (customer/salon/admin) |
| PATCH | `/api/bookings/:id` | user | confirm / complete / cancel / no-show / reschedule |
| GET/POST | `/api/services`, `/api/staff` | mixed | Public lists + owner CRUD (`/:id` PATCH/DELETE) |
| GET/POST | `/api/reviews` | mixed | Public list + verified review creation |
| PATCH | `/api/reviews/:id` | user | reply / helpful / report / hide / publish |
| GET/POST | `/api/favorites` | user | Wishlist list/toggle |
| GET/PATCH | `/api/notifications` | user | List + mark read |
| POST | `/api/upload` | user | Cloudinary image upload |
| GET/POST | `/api/cities`, `/api/categories` | – / admin | Catalog |
| GET/PATCH | `/api/admin/users`, `/api/admin/salons`, `/api/admin/stats` | admin | Console data |

---

## ☁️ Deploying to Vercel

1. Push the repo to GitHub and **Import Project** in [Vercel](https://vercel.com).
2. Add environment variables (Project → Settings → Environment Variables): everything from `.env.example`, with production values:
   - `MONGODB_URI` → MongoDB Atlas connection string (allow access from `0.0.0.0/0` or Vercel IPs)
   - `AUTH_SECRET` → long random string
   - `AUTH_URL` + `NEXT_PUBLIC_APP_URL` → `https://yourdomain.com`
3. Deploy. Then seed production once from your machine:
   `MONGODB_URI=<atlas-uri> npm run seed` *(or create the admin user manually)*.
4. Point your domain, and submit `https://yourdomain.com/sitemap.xml` to Google Search Console.

**Production notes**
- The in-memory rate limiter is per-instance; for multi-region scale swap in Upstash Redis (`@upstash/ratelimit`) inside `src/server/api-helpers.ts` (single function to replace).
- Set up a cron (Vercel Cron) hitting a future `/api/cron/reminders` route to send day-before WhatsApp/email reminders — the notification architecture is already in place.

---

## 🛠 Troubleshooting

**Building inside a OneDrive-synced folder (Windows):** OneDrive can lock or offload files in `.next/` mid-build, causing random `Cannot find module './NNNN.js'` or `PageNotFoundError` failures. If you hit these:

```powershell
Remove-Item -Recurse -Force .next; npm run build
```

…or (recommended) right-click the project folder → *Always keep on this device*, or move the project outside OneDrive entirely (e.g. `C:\dev\getsalons`).

**Port already in use:** another app owns `:3000` on this machine — run `npx next start -p 3100` (or `npm run dev -- -p 3100`).

---

## 🗺️ Roadmap (architecture-ready)

- **Payments:** EasyPaisa / JazzCash / Stripe / PayFast — hook into the booking `price` + `Subscription` model
- **WhatsApp notifications:** set `WHATSAPP_PROVIDER=cloud-api` + token (adapter already implemented)
- **Google login:** add `AUTH_GOOGLE_ID/SECRET` — provider activates automatically
- Loyalty points, gift cards, referrals (models extend cleanly)
- Multi-branch salons, staff login accounts (User.role=`staff` + `salon` ref already exist)
- AI recommendations, mobile app API (REST layer is already app-consumable)

---

Built with 🖤 & 💛 for Pakistan's beauty industry.
