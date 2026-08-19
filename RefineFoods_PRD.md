# Product Requirements Document: RefineFoods

**Version:** 1.0
**Status:** Draft
**Owner:** Garo
**Last updated:** August 19, 2026

---

## 1. Purpose & Context

RefineFoods is a food-delivery **admin dashboard**, the first iteration in a portfolio series built to demonstrate that a fully-featured, production-quality internal tool can be built fast with AI-assisted development (Claude Code / agentic workflows). It is a from-scratch rebuild of RefineCore's public e-commerce admin demo, using original branding, mock business logic, and a real backend (not just static UI).

This is not a real commercial product. It is a **showcase artifact**: something Garo can point to in interviews, on FoundationFrontier, and in his portfolio to prove he can ship a real, working, well-architected admin panel quickly, with modern AI-assisted tooling.

### 1.1 Why this matters
- Concrete proof-of-capability for the AI Engineering / full-stack pivot.
- Reusable case study for FoundationFrontier content ("built in X hours with Claude Code").
- Foundation pattern that can be reskinned for future demo #2, #3, etc. (different verticals, same admin-dashboard skeleton).

### 1.2 Non-goals
- Not a real multi-tenant SaaS product.
- No real payments, no real couriers, no real customer PII.
- No mobile customer-facing app. This is the **internal ops/admin dashboard only**.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Demonstrate build speed | Time from scaffold to fully working demo (target: document actual hours spent) |
| Demonstrate production quality | Real auth, real DB, real map integration, no placeholder screens |
| Demonstrate design competence | Clean, consistent UI using shadcn/ui + Tailwind, dark mode support |
| Portfolio-readiness | Deployed, publicly viewable demo URL + write-up on FoundationFrontier |

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling / UI | Tailwind CSS + shadcn/ui + tweakcn theme tokens |
| ORM | Drizzle ORM |
| Database | Neon (serverless Postgres) |
| Auth | BetterAuth |
| Maps | Google Maps JavaScript API |
| Charts | Recharts (dashboard graphs) |
| Hosting | Vercel |
| Middleware | `proxy.ts` (per current Next.js convention) |
| Secrets | `.env` (never hardcoded) |

**Auth note on BetterAuth:** it's a reasonable pick here, framework-native to Next.js, self-hosted (no third-party dependency risk like a Clerk lockout), and has first-class Drizzle adapter support, so it fits this stack cleanly. No strong reason to push back on it for this use case.

---

## 4. User Roles

For v1, a single role is sufficient: **Admin** (internal staff). No customer-facing or courier-facing login. Role-based permissions (e.g. Store Manager vs Super Admin) are a stretch goal, not required for v1.

---

## 5. Information Architecture

Sidebar navigation (persistent, collapsible):
1. Dashboard
2. Orders
3. Customers
4. Products
5. Categories
6. Stores
7. Couriers
8. Logout

Global top bar: search (by Store ID / email / keyword), language selector (stub, English only for v1), dark/light mode toggle, user profile menu.

---

## 6. Feature Requirements by Module

### 6.1 Auth / Login
- Email + password sign-in via BetterAuth.
- "Remember me" checkbox (persistent session).
- "Forgot password" flow (can be stubbed to a real email-reset flow if time allows, otherwise UI-only with a note in the PRD as a known gap).
- "Sign up" link (optional for v1, single seeded admin account may be sufficient).
- Branded auth screen (logo, background image, RefineFoods identity).

### 6.2 Dashboard (Overview)
- Date-range selector (e.g. Last Week / Last Month), driving all widgets below.
- **Daily Revenue** area chart.
- **Daily Orders** bar chart.
- **New Customers** bar chart (with % change indicator).
- **Delivery Map**: real Google Map, centered on seeded store/order coordinates, with custom courier/order markers.
- **Timeline**: recent order status feed (Pending / Ready / Cancelled / Delivered) with relative timestamps.
- **Recent Orders** list: customer, address, line items, total, paginated.
- **Trending Products** list: ranked, with order count and revenue.

### 6.3 Orders
- Table: Order ID, Status, product thumbnails, Amount, Store, Customer, CreatedAt, row actions.
- Status values: Pending, Ready, On the way, Delivered, Cancelled.
- Sortable columns (Amount, CreatedAt), filterable by Status.
- Search by Store/Customer.
- CSV export.
- Pagination (server-side, given target volume of ~1,200 seeded orders).
- Order detail view (drawer or page) for full line items and status change.

### 6.4 Customers
- Table: ID, Avatar, Name, phone (Gsm No), Created At, Status (Active/Idle), row actions.
- Sortable by Created At, filterable by Status and Name.
- CSV export.
- Customer detail view (order history for that customer).
- ~600 seeded records, server-side pagination.

### 6.5 Products
- Table: ID, image, Name, Description (truncated), Price, Category, Status (Available/Unavailable), row actions.
- List/grid view toggle.
- Add/edit product (name, description, price, category, image, availability).
- Sortable by Price, filterable by Category and Status.
- ~79 seeded records.

### 6.6 Categories
- List: emoji/icon, Title, thumbnail strip of products in that category, Status (Visible/Hidden).
- Add/edit category, toggle visibility.
- ~10 seeded categories mapped to the seeded products.

### 6.7 Stores
- Table: ID, Title, Email, Phone, Address, Status (Open/Closed), row actions.
- List/map view toggle (map view reuses Google Maps integration).
- Add new store (with geocoded address for map placement).
- ~20 seeded records.

### 6.8 Couriers
- Table: ID, Avatar, Name, Vehicle ID, Gsm, assigned Store, Rating (star display), Status (Available/Offline/On delivery), row actions.
- Add new courier.
- ~70 seeded records.

---

## 7. Data Model (Drizzle schema, high level)

```
stores        (id, title, email, phone, address, lat, lng, status, created_at)
categories    (id, title, icon, status)
products      (id, name, description, price, category_id -> categories, image_url, status)
customers     (id, name, phone, status, created_at)
couriers      (id, name, vehicle_id, phone, store_id -> stores, rating, status)
orders        (id, status, amount, store_id -> stores, customer_id -> customers, courier_id -> couriers, created_at)
order_items   (id, order_id -> orders, product_id -> products, quantity, price_at_order)
admin_users   (id, name, email, password_hash, created_at)  -- via BetterAuth
```

Seed script generates realistic mock data (Faker.js or similar) for all of the above at the volumes referenced per screen (600 customers, 1200 orders, 79 products, 70 couriers, 20 stores, 10 categories).

---

## 8. Non-Functional Requirements

- **Responsiveness:** desktop-first (matches reference screens), but should not visibly break on tablet widths.
- **Dark mode:** full support, toggle in top bar, using shadcn/tweakcn tokens only (no hardcoded colors).
- **Performance:** server-side pagination on all large tables (orders, customers) to avoid client-side over-fetching.
- **Accessibility:** semantic table markup, focus states via `ring-ring`, adequate color contrast in both themes.
- **Security:** BetterAuth session handling, protected routes via `proxy.ts` middleware, no secrets in client bundle.

---

## 9. Design Guidelines

- Tailwind utility classes only, shadcn/ui primitives first, tweakcn CSS variable tokens for theming (see project frontend skill for full token reference).
- Original RefineFoods brand identity (logo, color palette, typography) distinct from RefineCore's reference demo, this is a redesign/rebuild, not a clone.
- Fonts loaded via `next/font/google`.

---

## 10. Phased Plan

| Phase | Scope |
|---|---|
| 1. Foundation | Next.js scaffold, Drizzle + Neon setup, BetterAuth, seed script, sidebar shell |
| 2. Core CRUD screens | Orders, Customers, Products, Categories, Stores, Couriers tables + detail views |
| 3. Dashboard | Charts, Google Maps integration, timeline, trending products |
| 4. Polish | Dark mode pass, empty/loading/error states, responsive check, CSV export |
| 5. Ship | Deploy to Vercel, write up build process for FoundationFrontier |

---

## 11. Open Questions / Risks

- **Google Maps API cost/quota**: needs an API key with billing enabled; confirm usage stays within free tier for a low-traffic demo.
- **Forgot-password flow**: real email delivery (e.g. Resend) vs. UI-only stub, decide before Phase 4.
- **Seed data realism**: worth double-checking generated addresses actually geocode correctly for the map view.
- **Scope creep risk**: this is a speed-of-build showcase, resist adding features (like RBAC or multi-tenant) that aren't in the reference screens.

---

## 12. Out of Scope (v1)

- Real payments/checkout
- Customer-facing storefront
- Courier mobile app
- Multi-language i18n (selector is present but stubbed to English only)
- Role-based permissions beyond single Admin role
