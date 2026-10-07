# Skyline Manager Pro — Project Context / Memory File

> **For a future Claude session:** Read this file first, in full, before doing anything else on this project. It contains the full history, architecture, conventions, and known-pending items. Anthropic's cross-chat memory is not enabled for this user, so this file is the actual persistence layer between sessions — keep it updated as the source of truth.

**Last updated:** during active build session, through the Rent Roll/Billing system (6l). **Not a final state** — more features are actively being added; keep appending sections rather than treating this as a closed roadmap.

---

## 1. What this project is

An enterprise multi-tenant SaaS for managing buildings/apartments. Four roles, each with their own dashboard and permission scope:
- **Owner** — the paying SaaS tenant. Full CRUD over their own buildings, managers, employees, tenants. Everything is scoped by `ownerId`.
- **Manager** — assigned to exactly one building (`Building.managerId`). Read-only visibility into that building's employees and tenants.
- **Employee** — belongs to one building via `UserProfile.buildingId`. Views their own building info.
- **Tenant** — rents a unit via a `Tenancy` record. Views their own lease.

Tech stack: **Express + Sequelize + PostgreSQL (Neon)** backend, **React + TypeScript + Vite + Tailwind v4** frontend. Cookie-based JWT auth (httpOnly cookie, not localStorage).

## 2. Where the code lives

- Local path: `D:\full-stack projects\skyline-manager-pro`
- Accessed via the Filesystem MCP connector (`mcp__Filesystem__*` tools) — **not** the sandboxed `/home/claude` or `/mnt/user-data` paths, which belong to Claude's own container and are unrelated to this project.
- `server/` — backend
- `client/` — frontend

## 3. History — how we got here (read this to understand *why*, not just *what*)

1. **Started from a messy AI-exported zip** (`skyline-manager-pro.zip`) with duplicate controllers, duplicate routes (v1 + non-v1), a duplicate ~40-file unused dashboard tree in the frontend, no `tsconfig.json` despite being all TypeScript, and version-suffixed imports (`lucide-react@0.487.0`) baked into ~40 shadcn/ui files from a Figma/v0 export. Did a full audit + cleanup pass, verified with a real `npm run build` (not just visual inspection).
2. **Login/signup broke** after the initial cleanup — traced through several real bugs: a case-sensitive filename mismatch (`User.model.js` vs `user.model.js` — crashes on Linux, works by accident on Mac/Windows), a wrong env var name (`VITE_API_URL` vs the real `VITE_BACKEND_URL`), and finally a database schema drift issue (`ownerId NOT NULL` in Postgres not matching the model's `allowNull: true`) — root cause was `sequelize.sync()` being commented out with no migrations, so the dev DB schema had drifted from the models.
3. **Decided to rebuild the backend from scratch**, feature-based, with **Sequelize CLI migrations** as the permanent fix for schema drift (never use `sync({ force: true })` again once real data exists — always a new migration file for schema changes from now on).
4. **User re-uploaded a new `client.zip`** that reverted several earlier fixes (dead `components/owner/` tree came back, `RoleModal.tsx` reverted to broken API paths, etc.) and added new pages (`Financial.tsx`, `Analytics.tsx`, and real `manager/employee/tenant` dashboards) that had their own bugs (wrong API paths, response-shape mismatches, routes not wired in `App.tsx`).
5. Fixed those, then found and fixed: `App.tsx` route replacement mistake (pasting only new route blocks wiped out `/`, Home, and Owner routes — restored full file), `ProtectedRoute` prop mismatch (`allowedRoles` doesn't exist, real props are `user`/`role`/`loading`), `UserRole` type defined 3 different inconsistent ways across `Home.tsx`/`Hero.tsx`/`CTASection.tsx`/`RoleModal.tsx`, `navigate()` called in render body instead of `useEffect` in `RoleModal.tsx`, password min-length mismatch between frontend Zod (6) and backend Joi (8).
6. **Dark mode**: found it was fully non-functional for two independent reasons — (a) `GlobalContext.tsx` had `darkMode` state but never applied the `.dark` class to `<html>` or persisted it, and (b) **Tailwind v4 changed dark-mode behavior** — `dark:` now defaults to `prefers-color-scheme` media query only; you must explicitly add `@custom-variant dark (&:where(.dark, .dark *));` to `index.css` to make it respond to a class instead. Both are now fixed.
7. **Sidebar toggle bug**: `OwnerLayout.tsx` (and copies in Manager/Employee/Tenant layouts) had one button toggling *both* `sidebarOpen` (desktop collapse) and `mobileSidebarOpen` (mobile drawer) at once — two unrelated concerns conflated into one handler. Fixed by checking `window.innerWidth >= 1024` to decide which state to toggle, and initializing `sidebarOpen` via a lazy `useState` initializer tied to actual screen width at mount instead of a hardcoded `true`.
8. Redesigned the Owner Dashboard: flat status-driven KPI cards (not gradient-card-kit cliché), Manrope font for headings/numbers, brand blue kept as the single accent with semantic color (emerald/amber/red) reserved for things needing attention (payment health), loading skeleton, empty states that point at an action.
9. **`index.css` was a frozen Tailwind build artifact, not live source** — discovered after "sidebar won't toggle" reports kept happening despite the logic being correct. The file was a one-time, hand-pasted snapshot of Tailwind's own *compiled output* (classic sign of a Figma-Make/v0 export), containing a complete `@layer utilities` block of already-resolved classes frozen at whatever the codebase looked like at export time. Smoking gun: `.w-64`/`.w-16` (the sidebar's expand/collapse widths) weren't in the frozen file at all, and the `@custom-variant dark (&:where(.dark, .dark *));` line had been lost entirely. **Fixed by gutting the file down to only genuinely custom content** — the `@import "tailwindcss";` directive, the `@custom-variant dark` line, `@theme` (brand color, font-display), 2 custom keyframe animations, and the shadcn-style CSS variable design tokens (`--background`, `--card`, `--foreground`, etc., referenced by `bg-card`/`text-foreground`/etc. throughout the app) — removing everything Tailwind v4 already generates live via its Vite plugin (`@layer properties`, `@layer theme`, the frozen `@layer utilities`, all `@property --tw-*` declarations). After this fix, also had to clear the Vite cache (`rm -rf node_modules/.vite`) since it was serving stale output.
10. **`RoleModal.tsx` rebuilt from scratch** after the CSS fix, since it depended on shadcn `ui/` primitives (`Dialog`, `Button`, `Input`, `Label`, `Separator`) whose internal styling became inconsistent post-cleanup. Replaced with a fully self-contained modal using the same explicit hand-rolled Tailwind pattern used everywhere else in the app (backdrop + centered `rounded-2xl` panel) — no more dependency on Radix internals, can't drift out of sync with the rest of the design system again. Also fixed a latent bug while rebuilding: `roleConfig[selectedRole]` ran before the `null`-guard, which would have thrown if `selectedRole` were ever `null` on first render.

## 4. Backend architecture (feature-based, as of the rebuild)

```
server/
├── migrations/                    ← Sequelize CLI migrations — THE source of truth for schema now
├── seeders/
├── .sequelizerc
├── src/
│   ├── config/                    (renamed from "configs")
│   │   ├── db.js, config.cjs, cloudinary.js, nodemailer.js, passport.js
│   ├── models/                    ← stays centralized (Sequelize needs this for associations)
│   │   ├── User.model.js, OwnerProfile.model.js, UserProfile.model.js,
│   │   │   Building.model.js, Tenancy.model.js, Invitation.model.js,
│   │   │   MaintenanceRequest.model.js, Announcement.model.js, Document.model.js, PaymentAccount.model.js, PaymentSubmission.model.js, Expense.model.js, Vendor.model.js, Inspection.model.js, LeaseSignature.model.js, RentCharge.model.js, associations.js, index.js
│   ├── shared/
│   │   ├── middlewares/  (authenticate, authorize, tenantScope, validate, errorHandler, rateLimiter, multer)
│   │   ├── utils/         (ApiResponse, asyncHandler)
│   │   └── services/      (token.service — was auth.service, email.service, cloudinary.service)
│   ├── features/
│   │   ├── auth/        (controller, routes, validator)
│   │   ├── owner/       (controller, routes) — also has analytics/financial endpoints, see 6b
│   │   ├── buildings/   (controller, routes)
│   │   ├── staff/       (controller, service, routes) — managers + employees
│   │   ├── tenants/     (controller, routes)
│   │   ├── manager/     (controller, routes) — manager's OWN scoped dashboard/building view
│   │   ├── maintenance/ (controller, routes, validator) — work orders, see section 6d
│   │   ├── announcements/ (controller, routes, validator) — broadcast posts, see section 6e
│   │   ├── documents/ (controller, routes, validator) — lease/ID/inspection storage, see section 6f
│   │   ├── payments/ (paymentAccount.controller, paymentSubmission.controller, routes, validator) — manual payment system, see section 6g
│   │   ├── expenses/ (controller, routes, validator) — expense tracking, see section 6h
│   │   ├── vendors/ (controller, routes, validator) — outside contractors, see section 6i
│   │   ├── inspections/ (controller, routes, validator) — move-in/move-out checklists, see section 6j
│   │   ├── signatures/ (controller, routes, validator) — lease e-signature, see section 6k
│   │   └── billing/ (controller, service, validator, routes) — rent roll / recurring billing, see section 6l
│   ├── jobs/
│   │   └── billingCron.js — daily node-cron job, see section 6l
│   └── routes/index.js  (mounts all feature routers under /api/v1)
└── server.js
```

**Why models stay centralized:** Sequelize associations must be wired in one place after all models exist. Splitting per-feature would just mean `associations.js` importing from 5 folders — no real benefit. The genuine "feature-based" win is controllers/services/routes.

### Key backend conventions
- Every response uses `ApiResponse.success(res, status, message, data)` or `.error(...)` or `.paginated(...)` — shape is always `{ success, message, data }` (or `+ pagination`).
- `tenantScope` middleware sets `req.scopedOwnerId` — owners get their own id, staff/tenants get `req.user.ownerId`. **Always filter queries by this, never by raw `req.user.id`**, for multi-tenant isolation.
- `authenticate` → `tenantScope` → `authorize(...)` is the standard middleware chain order.
- A manager is scoped to exactly **one** building via `Building.findOne({ where: { managerId: req.user.id } })` — never `findAll`.
- `staff.controller.js`'s `createStaffWithProfile`/`updateStaffWithProfile`/`deleteStaffWithCleanup`/`findStaffByIdScoped` helpers (in `staff.service.js`) are shared and reused by `tenant.controller.js` too — this is a legitimate cross-feature dependency, not a mistake.
- Auth: only **owners self-register** via `/auth/signup`. All other roles are created BY the owner (staff/tenant features), get a temp password emailed to them, and `mustChangePassword: true` until they change it.
- `/auth/login` is universal for all 4 roles.

### Schema/migrations discipline (IMPORTANT — do not violate this)
- The dev DB schema drift bug (see history #2 above) is why we set up Sequelize CLI migrations. **From now on: any model change = a new migration file, run with `npm run db:migrate`. Never use `sync({ force: true })` or `sync({ alter: true })` again once there's real user data** — `alter: true` doesn't reliably drop constraints anyway (that's the bug that bit us).
- `server/src/config/config.cjs` is the CLI's own config (separate from `db.js` because the CLI can't use the ESM Sequelize instance directly).

## 5. Frontend architecture

```
client/src/
├── App.tsx              ← all routing. See "routing gotcha" below.
├── main.tsx
├── lib/api.ts            ← single axios instance, baseURL = `${VITE_BACKEND_URL}/api/v1`
├── context/GlobalContext.tsx  ← user auth state + darkMode (now correctly wired)
├── middleware/ProtectedRoute.tsx  ← props are `user`, `role`, `children`, `loading` (NOT `allowedRoles`)
├── layouts/  (OwnerLayout, ManagerLayout, EmployeeLayout, TenantLayout — near-identical, candidate for a shared hook/component later)
├── components/
│   ├── common/  (AppSidebar.tsx — reads nav config by role internally; AppHeader.tsx — has the dark mode toggle + menu button)
│   ├── Home/    (Header, Hero, FeaturesShowcase, CTASection, Footer, RoleModal, ValueProposition, TrustIndicators)
│   ├── ui/      ← shadcn kit, used by Home/marketing pages
│   └── ErrorBoundary.tsx
├── pages/
│   ├── Home.tsx           ← public landing page + role-select buttons → opens RoleModal
│   ├── auth/               (VerifyEmail.tsx, ChangePassword.tsx)
│   ├── owner/              (Dashboard, Buildings, Managers, Employees, Tenants, Settings, Analytics, Financial, Maintenance, Announcements, Documents, PaymentAccounts, Payments, Expenses, Vendors, Inspections, RentRoll)
│   ├── manager/            (Dashboard, Building, Employees, Tenants, Maintenance, Announcements, Documents, Payments, Expenses, Inspections, RentRoll)
│   ├── employee/           (Dashboard, Building, Maintenance, Announcements)
│   └── tenant/             (Dashboard, Lease, Maintenance, Announcements, Documents, Payments, Inspections)
├── components/SignaturePad.tsx ← reusable canvas-based signature capture, no external library, used by Lease E-Signature (6k)
├── lib/maintenanceStyles.ts  ← shared category/priority/status badge config, used by all 4 Maintenance pages (also reused by Vendors for specialty icons)
├── lib/announcementStyles.ts ← shared priority badge config, used by all 4 Announcements pages
├── lib/documentStyles.ts     ← shared category icon/label config, used by Owner/Manager/Tenant Documents pages
├── lib/paymentStyles.ts      ← shared method/status config, used by Owner/Manager/Tenant Payments pages
├── lib/expenseStyles.ts      ← shared category icon/label config, used by Owner/Manager Expenses pages
├── lib/inspectionStyles.ts   ← shared condition badge config, used by Owner/Manager/Tenant Inspections pages
├── lib/billingStyles.ts      ← shared charge-status badge config, used by Owner/Manager RentRoll pages
└── types/index.ts          ← THE canonical UserRole/User/Building/Tenancy/etc. types. Never redeclare UserRole locally anywhere else.
```
All pages listed are real and wired to the backend — `Analytics`/`Financial` were placeholders earlier in the project but are now built (see 6b), as is `Maintenance` (see 6d), `Announcements` (see 6e), `Documents` (see 6f — Owner/Manager/Tenant only, not Employee, a deliberate scoping choice), the manual Payment system (see 6g — Owner/Manager/Tenant only), Expense tracking (see 6h — Owner/Manager only, which also upgraded `Financial.tsx` from revenue-only to real profit/loss), Vendor Accounts (see 6i — Owner only, extends Maintenance's assignment flow), Inspection Checklists (see 6j — Owner/Manager/Tenant, not Employee), Lease E-Signature (see 6k — woven into `Tenants.tsx` and `Lease.tsx` rather than standalone pages), and the Rent Roll / Billing system (see 6l — Owner/Manager only; the tenant-facing side is woven into the existing `tenant/Payments.tsx` charge-picker rather than a standalone page).

### Critical frontend conventions — READ BEFORE TOUCHING API CALLS OR ROUTING

1. **API paths**: `lib/api.ts`'s `baseURL` already includes `/api/v1`. Every call site must use **short paths only**: `api.get('/staff')`, `api.post('/auth/login')`. **Never** write `/api/v1/...` at a call site — this bug has recurred multiple times across regenerated files and causes silent 404s. The only exception is raw `window.location.href` redirects (e.g. Google OAuth), which aren't going through the axios instance and need the full path.
2. **`UserRole` type**: only ever import it from `'../types'` (→ `types/index.ts`). It has been wrongly redeclared locally or imported from `'../../App'` (which doesn't export it) multiple times across `Home.tsx`, `Hero.tsx`, `CTASection.tsx`, `RoleModal.tsx` — all fixed now, but if a new component needs it, import from `types`, don't reinvent it.
3. **`App.tsx` routing gotcha**: when editing routes, **edit the file, don't replace the whole `<Routes>` block** — this already caused one incident where pasting in just the new manager/employee/tenant route blocks wiped out `/`, the Owner routes, and the catch-all. The full current route tree: `/` (Home), `/verify-email`, `/change-password` (top-level, any authenticated role), then `/owner`, `/manager`, `/employee`, `/tenant` each with `ProtectedRoute` wrapping a `*Layout`, with nested `<Route index>` + named children.
4. **`ProtectedRoute` real props**: `user`, `role` (string or array), `children`, `loading`. Not `allowedRoles`. Redirects unauthorized/unauthenticated users to `/` (there's no separate `/login` route — login is the modal on Home).
5. **Response shape**: backend always returns `{ success, message, data }` (or `+pagination`). When a controller returns e.g. `{ user }`, the frontend must unwrap `res.data.data.user`, not `res.data.user`.
6. **Dark mode**: requires all three of: (a) `GlobalContext.tsx`'s `useEffect` toggling `document.documentElement.classList` + localStorage, (b) `@custom-variant dark (&:where(.dark, .dark *));` in `index.css` (Tailwind v4 requirement — this line was lost entirely at one point, see history #9; `index.css` is now a clean, minimal file and this line is confirmed present at the top, right after `@import "tailwindcss";`), (c) `main.tsx` importing `GlobalContext` without a wrong file extension (this import has reverted to a broken `.jsx` extension — the real file is `.tsx` — more than once across sessions; double-check it if dark mode or auth state ever "mysteriously" stops working).
7. **`index.css` discipline (IMPORTANT, see history #9)**: this file must stay minimal — only `@import "tailwindcss";`, `@custom-variant dark`, `@theme` (brand color + font), custom keyframes, and the CSS variable design tokens. **Never hand-paste Tailwind's compiled output back into this file** — that's exactly what broke the sidebar toggle and dark mode for an extended period. If a utility class doesn't seem to apply, the fix is almost never "add it to index.css by hand" — it's checking that the class is spelled correctly and that Tailwind's live Vite-plugin scanning can see it (e.g. dynamic class strings like `` `bg-${accent}-600` `` need a literal safelist comment somewhere in the file, a pattern used throughout the KPI cards, RoleModal, etc.).
8. **Sidebar state**: `sidebarOpen` (desktop collapse) and `mobileSidebarOpen` (mobile drawer) are separate concerns for separate screen sizes — never toggle both from one handler. Use `window.innerWidth >= 1024` to decide which one a menu-button click should affect.
9. Files have reverted to earlier broken states multiple times across re-uploaded zips (RoleModal, App.tsx, dead `components/owner/` tree, `configs/` folder, `types.ts` duplicate, `react-jsx-runtime.d.ts` hack). **If something that was already fixed appears broken again, check whether an old file/zip got re-merged in before assuming it's a new bug.**

## 6. Owner dashboard redesign (session 2) — reference-driven rebuild, step by step

User supplied a reference HTML dashboard (dark sidebar, icon-chip KPI cards, donut/bar charts, activity timeline) and we rebuilt the Owner section to match it, step by step, fixing real bugs along the way rather than just reskinning. Steps 1-10 are done:

1. **Sidebar** (`AppSidebar.tsx`) — permanently dark (`bg-slate-900`, doesn't flip with light/dark mode — intentional, a stable brand anchor like Linear/Vercel), nav grouped into labeled sections (Main/Insights/System), owner-only "Upgrade Plan" card (currently static copy, not yet wired to real plan data).
2. **Header** (`AppHeader.tsx`) — added time-based greeting (dashboard routes only), a visual-only search bar (no backend search endpoint exists — don't wire it to anything until one does), full avatar+name+role block.
3. **KPI cards** — real counts from `/owner/dashboard`, status badges computed from real data (e.g. "2 inactive", "3 overdue") rather than fabricated trend percentages like the reference's fake `+12%`.
4. **Charts** — reference wanted a revenue history + 3-way occupancy donut (incl. "Under Maintenance"); we don't have a payments ledger (dated transactions) or a maintenance-ticket feature, so building fake history would mean fabricating numbers. Built instead: a **Revenue Breakdown** bar chart (Expected/Collected/Overdue — a real current-month snapshot from `Tenancy.monthlyRent` + `paymentStatus`) and a 2-segment **Occupancy** donut (Occupied/Vacant from real `Building.units` + active `Tenancy` count). Backend: `getDashboard` now also returns `revenue` and `occupancy` objects.
5. **Tables/Activity** — reference wanted a maintenance-ticket table and an audit-log timeline; neither feature exists. Built instead: a **Recent Tenants** table (real data, not previously surfaced on the dashboard) and an **activity timeline synthesized** by merging the existing recentBuildings/recentStaff/recentTenants queries sorted by `createdAt` — real events, just not from a dedicated audit-log table (a proper one is a good future feature, see pending list).

**Then did a full audit pass on the other 5 owner pages** (Buildings, Managers, Employees, Tenants, Settings) — these had never been touched since the original client.zip re-upload, and had accumulated serious, previously-undiscovered bugs:

- **`Managers.tsx`, `Employees.tsx`, `Tenants.tsx`, `Settings.tsx` all had the broken `import { api } from '../../lib/api'` named-import bug** (real export is `default`) — meaning **all 4 of these pages were completely non-functional**, not just buggy, until this pass. This is the single most-recurring bug in the whole project — check this import first on any page that "does nothing."
- **Managers/Employees**: read `manager.phone`/`.salary`/`.jobTitle`/`.buildingId` as flat fields, but the real API nests them under `manager.profile.*` (`UserProfile` association) — edit forms always showed blank, table always showed missing data.
- **Tenants**: same class of bug but worse — code read `tenant.leases`, but the real association is named `tenant.tenancies`. Payment status toggle was silently sending `tenancyId: undefined` and always failing. Also found and fixed a genuine **backend gap**: `updateTenant` only ever accepted `name/email/status/phone` — editing rent/unit/lease-dates silently did nothing. Extended the controller to also update the tenant's active `Tenancy` record when lease fields are submitted.
- **Settings**: `getProfile`'s response is `{ data: { user } }` but the page read `res.data.data` as if it were the user directly — always blank. Also used completely wrong field names (`companyName`/`address` vs the real `businessName`/`businessAddress`/`taxId` on `OwnerProfile`) — saving silently updated nothing meaningful even once loading was fixed. Added a real subscription-plan display and a link to the existing (previously unreachable from any nav) `/change-password` page.
- **Buildings.tsx** was the one page that was already solid — added the missing manager-assignment dropdown (backend supported it, UI never exposed it) and a font-consistency pass, nothing structurally wrong.

**New pattern to watch for:** `Managers.tsx`/`Employees.tsx` are now near-identical in structure (same bugs, same fixes) — good candidate to consolidate into one shared `StaffTable` component parameterized by role, so a future bug gets fixed once instead of twice. Not done yet — pending, see below.

## 6b. Analytics & Financial — completed (Step 11)

Both pages previously static placeholders; now real, backed by two new endpoints. No fabricated history anywhere — current-state composition only, since there's no payments-ledger or snapshot table for genuine trends yet.

- **`GET /api/v1/owner/analytics`** (`getAnalytics` in `owner.controller.js`) — buildings grouped by type/status, and a per-building breakdown (units, occupied, occupancyRate, hasManager, employee count). Per-building stats are N queries (one per building) rather than a single aggregate query — fine at the scale of buildings-per-owner, revisit if that assumption ever changes.
- **`GET /api/v1/owner/financial`** (`getFinancial`) — revenue per building (expected/collected/outstanding) plus a sorted (overdue → partial → unpaid) outstanding-balances list across all tenants. `Financial.tsx` includes a working **"Mark Paid" button** that reuses the exact same `PATCH /tenants/:id/payment` endpoint `Tenants.tsx` already uses — same action, surfaced in a second place.
- Frontend: `AnalyticsData` and `FinancialData` added to `types/index.ts`.
- `Analytics.tsx` renders a stacked horizontal bar (occupied/vacant) per building and a staff-coverage table; `Financial.tsx` renders a grouped horizontal bar (expected/collected) and the outstanding-balances table.

**This completes the full Owner section** — Dashboard + Buildings + Managers + Employees + Tenants + Settings + Analytics + Financial are all real, wired to the backend, and bug-audited. Next up per the original plan: Manager dashboard, then Employee, then Tenant.

## 6c. Manager / Employee / Tenant dashboards — audited and fixed

Same audit-then-fix pass applied to the other 3 role sections (Owner was done first, see section 6/6b).

**Confirmed, exactly as suspected:** `ManagerLayout.tsx`, `EmployeeLayout.tsx`, and `TenantLayout.tsx` **all independently had the stale sidebar-toggle bug** (the combined-toggle-state bug fixed in `OwnerLayout.tsx` much earlier never got copied to the other 3). This is now very strong evidence for finally consolidating the 4 layout files — see pending list, this is no longer theoretical, it's a bug that's now been fixed 4 separate times.

- **Manager**: `Dashboard.tsx` read `data.buildingsCount` (doesn't exist — real field is `data.building`, singular since a manager has exactly one) and `recentActivity[].description`/`.date` (doesn't exist — real items are `Tenancy` records with `.tenant.name`/`.unitNumber`/`.createdAt`). Rebuilt to match the real shape, with a distinct empty state for "not assigned to a building yet" vs. an assigned building with zero activity. `Building.tsx`/`Employees.tsx`/`Tenants.tsx` were already functionally correct (right paths, right `.profile`/`.tenancies` nesting) — only needed the double-padding fix (pages were wrapping themselves in `p-6` on top of the layout's own `p-6 lg:p-8`) and a Manrope font pass.
- **Employee**: `Dashboard.tsx` read `user.assignedBuilding` — doesn't exist; real path is `user.profile.building` (and `Building.tsx`, its sibling page, already correctly used that exact path — the bug was isolated to Dashboard). Fixed, and also surfaced `profile.jobTitle` which was available but unused.
- **Tenant**: `Dashboard.tsx` had the worst bug of the three — `statusConfig` only defined 3 payment statuses (`paid`/`unpaid`/`overdue`) but the real enum has 4 (`+ partial`), so **any tenant with a `partial` payment status would crash the page outright** (`Cannot read properties of undefined` on `statusConfig[status].icon`). Also read `lease.buildingName`/`.startDate`/`.endDate` which don't exist (real: `lease.building.name`/`.leaseStart`/`.leaseEnd`) — every date rendered as "Invalid Date" and the building name never showed. Fixed all three, and gave the previously-silent "Make a Payment" no-op button a toast explaining online payments aren't built yet, rather than it looking broken. `Lease.tsx` was already correct, only needed the padding/font pass.

**This completes the full audit across all 4 role sections.** Every page in the app now uses real data correctly, matches the design system, and the sidebar-toggle bug can't silently reappear in a 5th place because there isn't one left unfixed.

## 6d. Maintenance / Work Orders — first brand-new feature built from scratch

Previously the #1 flagged gap across the whole project (mentioned repeatedly while building the Dashboard, Analytics, and Financial pages: "no maintenance-ticket feature exists"). Researched real property-management software (Buildium, AppFolio, TenantCloud, Anabode) before building — maintenance/work-order management is the single most universal feature across every one of them, so it was the clear highest-priority feature to add next. Full build, backend + all 4 role frontends:

- **New model**: `MaintenanceRequest.model.js` (new migration, not a hand-edit — `create-maintenance-requests`). Fields: `buildingId`, `reportedById`, `assignedToId` (nullable), `unitNumber`, `title`, `description`, `category` (plumbing/electrical/hvac/appliance/structural/pest-control/other), `priority` (low/medium/high/urgent), `status` (open/in-progress/resolved/cancelled), `photoUrl` (Cloudinary), `resolutionNotes`, `resolvedAt`. Paranoid (soft-delete), scoped by `ownerId` like everything else.
- **New feature folder**: `features/maintenance/` (controller, routes, validator) — mounted at `/api/v1/maintenance`.
- **Visibility is role-scoped in the controller, same pattern as staff/tenants**: owner sees their whole portfolio; manager sees only their one building (`Building.managerId`); employee sees their building (resolved via their `UserProfile.buildingId`, same pattern `staff.controller.js` uses) *plus* anything assigned to them; tenant sees only requests they personally reported.
- Who can do what: tenant + employee can **create** a request; owner + manager can **assign** it to a manager/employee; owner + manager + the assigned employee can **update status**; owner + manager can **delete**.
- **Frontend**: one page per role (`owner/Maintenance.tsx`, `manager/Maintenance.tsx`, `employee/Maintenance.tsx`, `tenant/Maintenance.tsx`) since each role's capabilities genuinely differ (tenant only sees/creates their own; owner gets portfolio-wide filters; manager/employee get assign/status controls). Shared styling pulled into `lib/maintenanceStyles.ts` (category icons, priority/status badge colors) so a visual tweak only has to happen once across all 4.
- Photo upload reuses the existing Cloudinary/multer pipeline (`multer.js` gained a new `maintenancePhotoUpload` single-file export).
- **This also partially addresses the "audit-log" pending item below** — maintenance requests are now a second source of real, timestamped events (creation, assignment, status changes) that the Dashboard activity feed and Analytics could pull from instead of (or alongside) the synthesized buildings/staff/tenants timeline. Not yet wired in that direction — still pending, but now easier since the real data exists.

## 6e. Announcements — second brand-new feature, same scoping pattern reused

Built right after Maintenance, from the same research pass (announcements/communication was the other Tier 1 feature identified as universal across property-management software). Went faster than Maintenance since the role-scoped-visibility pattern was now established and could be reused almost directly.

- **New model**: `Announcement.model.js` (migration `create-announcements`). Fields: `buildingId` (nullable — `null` means portfolio-wide, visible across every building the owner has), `authorId`, `title`, `body`, `priority` (info/warning/urgent). Not paranoid (soft-delete wasn't judged necessary for this one — a deliberate, smaller-footprint choice vs. most other models).
- **New feature folder**: `features/announcements/` — mounted at `/api/v1/announcements`.
- **Visibility**: owner sees everything in their portfolio (optionally filtered by building); manager sees portfolio-wide posts (`buildingId: null`) plus their own building's; employee/tenant see portfolio-wide plus their building's (resolved the same way Maintenance does — employee via `UserProfile.buildingId`, tenant via their active `Tenancy.buildingId`).
- **Posting rules**: owner can post to any specific building or portfolio-wide (`buildingId: null`); a manager can only ever post to their own building — **the server forces this and ignores whatever `buildingId` the client sends** for a manager request, rather than trusting it. Only the original author (or an owner, for anyone's post in their portfolio) can edit/delete.
- **Frontend**: 4 pages again, but only 2 real variants — owner gets full CRUD + a building filter; manager gets create (building auto-forced) + edit/delete scoped to their own posts only (an `isMine` check in the UI, enforced for real server-side too); employee and tenant are plain read-only feeds (literally identical component logic, just copy-pasted with a different accent color — a candidate for the same kind of consolidation `Managers.tsx`/`Employees.tsx` already need). Shared priority badge styling in `lib/announcementStyles.ts`.

## 6f. Document Storage — third brand-new feature, deliberately scoped to 3 of 4 roles

The other Tier 1 feature from the research. Unlike Maintenance/Announcements, this one is **not** built for Employee — a considered choice, not an oversight: in real property-management software, document access (leases, ID verification, insurance) is normally an owner/manager/tenant concern, and extending it to general maintenance/admin staff wasn't justified by anything in the research.

- **New model**: `Document.model.js` (migration `create-documents`). Fields: `buildingId` (nullable), `tenancyId` (nullable — set for lease documents), `subjectUserId` (nullable — whose personal document this is, e.g. an ID or insurance file), `uploadedById`, `title`, `category` (lease/id_proof/insurance/inspection/permit/financial/other), `fileUrl`, `fileType`. A document can be linked to a building, a tenancy, a specific person, or nothing specific — deliberately loose rather than forcing a rigid combination, since real documents don't all fit one shape.
- **New feature folder**: `features/documents/` — mounted at `/api/v1/documents`. Reuses the Cloudinary/multer pipeline, extended with a new `documentUpload`/`singleDocumentUpload` config that (unlike the avatar/CNIC `imagesUpload`) accepts PDFs via `resource_type: "auto"`, with a larger 10MB limit since lease scans run bigger than profile photos.
- **Visibility**: owner sees their whole portfolio; manager sees documents tied to their building OR to any tenancy within it (so they can see a tenant's lease/ID for verification — a deliberate real-world-accurate choice, not a privacy oversight); tenant sees only documents that are specifically theirs (`subjectUserId` = them, or `tenancyId` = their own lease).
- **Upload rules**: owner/manager can upload any category, scoped to their building/portfolio; **a tenant can only self-upload `id_proof`/`insurance`** — the server rejects any other category from a tenant and forces `subjectUserId` to themselves, since a lease is something the owner/manager issues, not something a tenant should be able to fabricate.
- **Frontend**: 3 pages (`owner/Documents.tsx` full browse/upload/delete with building+category filters; `manager/Documents.tsx` their building + its tenants' leases; `tenant/Documents.tsx` their own documents + self-service ID/insurance upload). Shared category icon/label config in `lib/documentStyles.ts`. The shared type is named `AppDocument`, not `Document` — `Document` collides with the browser's built-in DOM type.

## 6g. Manual Payment System — fourth brand-new feature, built for the Pakistani market specifically

The user flagged that Stripe/PayPal don't work for Pakistan. Researched the actual real-world pattern used there (WooCommerce Pakistan plugins, Pakistani SaaS billing guides) before building — it's extremely consistent: the owner lists receiving accounts (bank transfer, JazzCash, EasyPaisa), the payer transfers manually and uploads a screenshot as proof, and an admin reviews and approves/rejects. This is a manual verification workflow by design, not a lesser version of a real payment gateway — it's the standard approach there since neither JazzCash nor EasyPaisa (the two dominant mobile financial services) expose a public API for this kind of direct integration.

- **Two new models**: `PaymentAccount.model.js` (migration `create-payment-accounts` — the owner's receiving accounts: method, label, accountTitle, accountNumber, bankName/iban for bank transfers, an optional QR code image, isActive toggle) and `PaymentSubmission.model.js` (migration `create-payment-submissions` — a tenant's payment claim: tenancyId, paymentAccountId, amount, periodMonth, transactionReference, proofImageUrl, status pending/approved/rejected, reviewedById, reviewNotes, reviewedAt).
- **New feature folder**: `features/payments/` with two controllers (`paymentAccount.controller.js`, `paymentSubmission.controller.js`) sharing one `payment.routes.js` — mounted at `/api/v1/payments` (`/accounts` and `/submissions` sub-paths).
- **Who manages accounts**: owner only — it's the owner's business actually receiving money, not the manager's. Manager and tenant can only read active accounts (so a tenant can see where to send money).
- **Who reviews submissions**: owner (portfolio-wide) and manager (their building only, same `Building.managerId` scoping pattern used everywhere else) — so an owner doesn't have to personally approve every tenant's rent every month.
- **The one real integration point**: approving a submission automatically flips the related `Tenancy.paymentStatus` to `'paid'` — this ties directly into the existing Financial/Tenants pages rather than creating a second, disconnected payment-tracking system. A submission can only be reviewed once (`status !== 'pending'` is rejected server-side) to prevent double-processing.
- **Frontend**: `owner/PaymentAccounts.tsx` (manage receiving accounts, QR upload), `owner/Payments.tsx` + `manager/Payments.tsx` (review queue, approve/reject with a reason, click-to-enlarge proof image — these two pages are intentionally near-identical, same situation as the Announcements/StaffTable consolidation candidates), and `tenant/Payments.tsx` (a 2-step modal: pick a payment method → see the real account details with copy-to-clipboard → enter amount/reference → upload proof → submit, plus their own submission history with status badges). The Tenant Dashboard's "Make a Payment" button, which was previously just a toast saying "not available yet," now links to this real page.
- Proof uploads reuse the Documents feature's PDF-capable `documentUpload` config (`proofUpload` export in `multer.js`), since some banks issue PDF receipts, not just screenshots. QR code uploads reuse the plain image-only `upload` config (`qrCodeUpload` export).

## 6h. Expense Tracking — fifth brand-new feature, completes the Financial picture

The last Tier 1/Tier 2 item from the original research pass. `Financial.tsx` (6b) previously only tracked revenue — this adds the cost side, turning it into a real profit/loss view.

- **New model**: `Expense.model.js` (migration `create-expenses`). Fields: `buildingId` (required — unlike Announcements/Documents, every expense belongs to exactly one building, which is how real property accounting works), `recordedById`, `category` (maintenance/utilities/salary/insurance/tax/repairs/supplies/other), `description`, `vendor`, `amount`, `expenseDate`, `receiptUrl`.
- **New feature folder**: `features/expenses/` — mounted at `/api/v1/expenses`. Same ownership pattern as Announcements/Maintenance: a manager's `buildingId` is forced server-side on create (never trusted from the client), and a manager can only edit/delete expenses **they personally recorded** — an owner's own entries for that same building stay owner-only to edit.
- **The integration**: `owner.controller.js`'s `getFinancial` (6b) now also computes `expensesByBuilding` and merges it into the existing `revenueByBuilding` response, adding `expenses` and `netProfit` (= collected − expenses) to each row and to the overall `totals`. `Financial.tsx` gained a 4th summary card (Net Profit) and a 3rd bar series on the existing revenue-by-building chart — no new page needed on the Financial side, just real numbers flowing into what was already there.
- **Frontend**: `owner/Expenses.tsx` (full CRUD, building+category filters) and `manager/Expenses.tsx` (their building only, edit/delete gated to `recordedBy.id === user.id` in the UI, enforced server-side too). Receipt upload reuses the Documents feature's PDF-capable config (`receiptUpload` in `multer.js`). Not built for Employee/Tenant — recording costs is an owner/manager concern, same reasoning as Document Storage's Employee exclusion.

**This completes the entire researched feature roadmap from the original "what's missing vs. real property-management software" pass** — Maintenance, Announcements, Documents, Manual Payments, and now Expense Tracking are all real, end-to-end, role-scoped features. Remaining pending items are either smaller (vendor accounts, e-signature, inspection checklists) or structural cleanup (the 4-layout consolidation, StaffTable consolidation) rather than new feature gaps.

## 6i. Vendor Accounts — sixth brand-new feature, extends Maintenance rather than standing alone

First of the three smaller "remaining features" (vendor accounts, lease e-signature, inspection checklists). Chosen first because it directly extends Maintenance (6d) — a work order can now be assigned to an outside contractor, not just internal staff — rather than being an isolated feature.

- **New model**: `Vendor.model.js` (migration `create-vendors`). Fields: `name`, `companyName`, `phone`, `email`, `specialty` (plumbing/electrical/hvac/appliance/structural/pest-control/general), `notes`, `isActive`. Owner-managed only, same reasoning as `PaymentAccount` (6g) — it's the owner's business relationship with the contractor. Manager can read the active list to assign work, not create/edit/delete.
- **Schema change to an existing table, done the correct way**: a second migration (`add-vendor-to-maintenance-requests`) adds `assignedVendorId` to `maintenance_requests` via `queryInterface.addColumn` rather than hand-editing the model and hoping — the lesson from the original DB-drift incident (history #2) applied consistently now, 8 migrations in.
- **Mutual exclusivity enforced server-side**: `MaintenanceRequest.assignRequest` now accepts either `assignedToId` (staff) or `assignedVendorId` (vendor), validated with Joi's `.xor()` so exactly one must be provided. Assigning to one explicitly clears the other on the same request — a work order is never simultaneously "assigned to an employee" and "assigned to a vendor."
- **Frontend**: `owner/Vendors.tsx` (CRUD), plus both `owner/Maintenance.tsx` and `manager/Maintenance.tsx` got their assign dropdown upgraded to a grouped `<optgroup>` select (Staff / Vendors) with the selected value encoded as `"staff:<id>"` or `"vendor:<id>"` and parsed on change.
- **Two real mistakes made and caught while wiring this in**, worth remembering: (1) the manager page's assign dropdown was given code copied from the owner page that referenced `eligibleStaff` — a variable that only exists in `owner/Maintenance.tsx` (computed inline via `staff.filter(...)`); the manager page's equivalent state is just called `employees` and didn't need filtering at all, since the fetch already scopes `role: 'employee'` server-side. This would have been a `ReferenceError` at render time. (2) A duplicate status-badge `<span>` ended up pasted twice in the manager page's card markup. **Lesson for future instructions**: when giving a "same change as the other file" instruction, state the actual variable/state names per file rather than assuming structural identity — these two pages are similar but not identical, and assuming otherwise is exactly what caused both bugs.

## 6j. Inspection Checklists — seventh brand-new feature

Second of the three smaller "remaining features." Move-in/move-out condition documentation — protects both owner and tenant in security-deposit disputes.

- **New model**: `Inspection.model.js` (migration `create-inspections`). Fields: `tenancyId`, `inspectedById`, `type` (move_in/move_out), `inspectionDate`, `items` (JSONB array of `{area, item, condition, notes, photoUrl}`), `generalNotes`, `status` (draft/completed), `tenantAcknowledged`, `tenantAcknowledgedAt`. **Items are stored as JSONB, not a child table** — a deliberate choice matching the existing convention already used for `Building.extraFields`/`UserProfile.extraFields` in this schema, since a checklist's item list is genuinely flexible/variable-length and doesn't need its own relational table with the overhead that implies.
- **New feature folder**: `features/inspections/` — mounted at `/api/v1/inspections`. Same owner/manager scoping pattern as Maintenance/Expenses (manager's `buildingId` resolved from their own tenancy, not trusted from the client).
- **Tenant's one write action**: `PATCH /inspections/:id/acknowledge` — can only acknowledge a `completed` inspection tied to their own tenancy, can't create/edit/delete. This mirrors the Payment Submission review pattern (6g) in spirit: one role creates/manages, another role has a single, narrow confirming action.
- **Frontend**: `owner/Inspections.tsx` (full checklist builder — quick-add buttons for common areas like Kitchen/Bathroom/Bedroom, inline condition dropdowns per item, a separate "View Details" modal for a read-only pass), `manager/Inspections.tsx` (copied unmodified from the owner version — the `/tenants` fetch is already building-scoped server-side, so no component changes needed, unlike the Vendor Accounts lesson from 6i where assuming identical structure caused a bug; this time the structures genuinely are identical), and `tenant/Inspections.tsx` (read-only + the Acknowledge button).

## 6k. Lease E-Signature — eighth and final roadmap feature

The last of the three smaller "remaining features." Deliberately **not** a DocuSign-level legal e-sign system — a reasonable SaaS-appropriate acknowledgment: a canvas-drawn signature, a typed full legal name, an explicit agreement checkbox, and a timestamp + IP address captured server-side (`req.ip`, one-liner, no extra complexity) for a basic audit trail.

- **New model**: `LeaseSignature.model.js` (migration `create-lease-signatures`). Fields: `tenancyId`, `signerId`, `signerRole` (tenant/owner/manager — snapshotted at signing time), `signatureImageUrl`, `typedName`, `ipAddress`, `agreedAt`. **Append-only by design** — no update or delete endpoint exists, and a unique `(tenancyId, signerId)` DB index prevents the same person signing the same tenancy twice. This is the correct behavior for an audit trail, not a missing feature; if a lease needs re-signing, that's a new `Tenancy` record (a renewal), not a mutated signature on the old one.
- **New feature folder**: `features/signatures/` — mounted at `/api/v1/signatures`. A tenancy is "fully executed" when signatures exist from both a `tenant` and an `owner`/`manager` — computed on read (`isFullyExecuted` in the `GET /signatures/tenancy/:tenancyId` response), not stored as a separate flag.
- **New reusable frontend component**: `components/SignaturePad.tsx` — a plain `<canvas>` with pointer events (works for both mouse and touch, no external drawing library), exposing `getSignatureFile()` (returns a PNG `File` ready for `FormData`) and `clear()` via `useImperativeHandle`. Used identically in 3 places: `tenant/Lease.tsx` (sign), `owner/Tenants.tsx` and `manager/Tenants.tsx` (countersign).
- **Wiring lesson applied from 6i**: before writing instructions for `manager/Tenants.tsx`, the file was read first rather than assumed to mirror `owner/Tenants.tsx` — and it turned out to be a much simpler, earlier-built page (no pagination, no payment-status editing, no toast library even imported) that needed a full rewrite rather than patch-style edits. Checking first instead of assuming avoided repeating the exact mistake that caused the `eligibleStaff` bug in Vendor Accounts.

**This closes out the entire originally-researched feature roadmap as it stood at the time.** Eight brand-new features built end-to-end across this session so far: Maintenance, Announcements, Documents, Manual Payments, Expense Tracking, Vendor Accounts, Inspection Checklists, and Lease E-Signature — every one real, role-scoped, migration-backed, and integrated with what already existed rather than sitting disconnected. **The user then identified a ninth, architecturally significant gap (the Rent Roll/Billing system, see 6l) after a fresh round of research — more features are actively being added beyond this point, so treat this as a running log, not a finished list.**

## 6l. Rent Roll / Recurring Billing System — ninth feature, and the first that modifies existing models rather than only adding new ones

Identified via a fresh research pass specifically asking "what's still missing for *full* building/apartment management" after the original 8-feature roadmap was done. Universal finding across every source (Buildium, Baselane, Rent Manager, DoorLoop, Landlord Studio): automated recurring rent invoices, late fees, and a real tenant ledger are the single most consistently "must-have" feature in the category — more so than anything built in 6d-6k, including the manual payment system itself.

**The architectural gap this exposed**: `Tenancy.paymentStatus` was always a single mutable field representing only the *current* state — there was no month-by-month record of what was charged, when, and what was paid against it. This is also *why* a real historical revenue trend chart was correctly avoided earlier in the session (6/Step 4) rather than fabricated — the right fix was always a real ledger, not "wait for data to exist."

- **`Tenancy` gained 4 new billing-config fields** via `add-billing-config-to-tenancies` (an **ALTER**, not a new table — the first migration in this project that modifies an existing core model): `billingDueDay` (1-28), `gracePeriodDays` (default 5), `lateFeeType` (none/fixed/percent), `lateFeeValue`. Per-lease, not a global setting, since real leases can have different terms.
- **New model**: `RentCharge.model.js` (migration `create-rent-charges`) — one row per tenancy per billing month: `periodMonth`, `dueDate`, `baseAmount`, `appliedLateFee`, `amountPaid`, `status` (pending/partial/paid/overdue/waived), `paidAt`. Unique `(tenancyId, periodMonth)` index — the real safety net preventing duplicate charges, not just the idempotency logic in the generator.
- **New feature folder + service layer**: `features/billing/` has a `billing.service.js` separate from the controller — holds `generateMissingCharges()` (creates this month's charge for every active tenancy that doesn't have one, idempotent via the unique index), `applyLateFees()` (stamps the configured fee exactly once on anything past its grace period), and `recomputeChargeStatus()` (the one function that must be called after any payment touches a charge — also syncs `Tenancy.paymentStatus` to match, so every existing page reading that single field keeps working unchanged). Separating this into a service (not just controller functions) was deliberate: the cron job and the controller's manual-trigger endpoint both call the exact same functions, so there's no duplicate logic between "automatic" and "owner clicked a button" paths.
- **First scheduled job in the project**: `node-cron` (new dependency) runs `jobs/billingCron.js` daily at 02:00, calling the same two service functions the manual `POST /billing/run-cycle` endpoint does. Started from `server.js` right after `connectDB()` succeeds.
- **`PaymentSubmission` (6g) now links to a specific `RentCharge`** via a new nullable `rentChargeId` column (nullable specifically for backward compatibility with submissions made before this feature existed). `reviewSubmission`'s approval branch now has two paths: if `rentChargeId` is set, add the amount to that charge and call `recomputeChargeStatus()`; if not (an old submission), fall back to the original direct `Tenancy.paymentStatus = 'paid'` behavior. The tenant's payment flow (`tenant/Payments.tsx`) now requires picking a specific unpaid/overdue charge from a dropdown (auto-filling the exact amount owed, including any late fee) instead of freely typing an amount.
- **Frontend**: `owner/RentRoll.tsx` (full ledger table, status filter, a "Run Billing Cycle" manual-trigger button for testing/catch-up, waive action) and `manager/RentRoll.tsx` (identical minus the owner-only run-cycle button — `authorize("owner")` on that specific route). Billing config (due day / grace period / late fee) is edited via a small quick-edit modal added to the existing `owner/Tenants.tsx` table, not a new page — reuses the row-per-tenant structure already there.

## 7. Known-pending / not yet built

- **Structural cleanup is now the highest-value remaining work**, having shifted from "nice to have" to "actively causing bugs":
  - The 4 layout files (`OwnerLayout`, `ManagerLayout`, `EmployeeLayout`, `TenantLayout`) are near-duplicates — the sidebar-toggle fix had to be applied 4 separate times.
  - `Managers.tsx`/`Employees.tsx`, the employee/tenant `Announcements.tsx` pages, `owner`/`manager` `Payments.tsx`/`Expenses.tsx`/`Inspections.tsx`/`RentRoll.tsx`, and the Maintenance assign-dropdown logic all share the same copy-pasted owner/manager (or role-variant) scoping pattern — now **9 features deep**. The Vendor Accounts build (6i) caused a real `ReferenceError` bug directly from this duplication. A shared `StaffTable` component and/or a generic `useRoleScopedList()` hook would fix a bug once instead of N times going forward.
- Sidebar's "Upgrade Plan" card (Step 1) is still static copy — should pull the real `subscriptionPlan` from `/owner/profile`.
- Settings' "Upgrade Plan" button is a no-op — no billing/payment feature exists yet (about the SaaS's own subscription tiers, unrelated to the tenant-to-owner rent payment system in 6g/6l, which is live).
- A proper audit-log table (tracking real events like status changes, not just record creation) would let the dashboard's activity timeline be genuinely complete rather than synthesized from creation timestamps — Maintenance, Announcements, Documents, Payment submissions, Expenses, Vendor assignments, Inspections, lease Signatures, and now RentCharge status changes (6d-6l) are all real, timestamped event sources that could feed this.
- **A real historical revenue trend chart is now genuinely possible** (`RentCharge` rows are dated, real transaction records going forward) — Dashboard/Analytics/Financial still show current-state snapshots, not trends; wiring this in is a natural next polish item, not blocked on missing data anymore.
- `PaymentSubmission.rentChargeId` is nullable for backward compatibility with pre-6l submissions — the `reviewSubmission` fallback path (direct `Tenancy.paymentStatus` update, bypassing `RentCharge` entirely) will stay relevant indefinitely for historical records, but all new submissions should always have a `rentChargeId` going forward; worth a periodic sanity check that nothing is silently taking the fallback path it shouldn't.
- The second recommended feature from the last research pass, a real **Notification Center** (the `AppHeader.tsx` bell has been purely decorative all session — a static red dot, no real notifications behind it), is still pending — would also double as the audit-log's natural consumer.
- `GET /api/v1/buildings` currently allows `authorize("owner", "manager")` but isn't scoped to just the manager's one building at that endpoint (only `/api/v1/manager/building` is properly scoped).
- No automated tests anywhere yet.
- `.sequelizerc` / migrations — now 15 migrations exist (`create-initial-schema`, `create-maintenance-requests`, `create-announcements`, `create-documents`, `create-payment-accounts`, `create-payment-submissions`, `create-expenses`, `create-vendors`, `add-vendor-to-maintenance-requests`, `create-inspections`, `create-lease-signatures`, `add-billing-config-to-tenancies`, `create-rent-charges`, `add-rent-charge-to-payment-submissions`) — future schema changes need new migration files, not manual edits to models + hope. Note `add-billing-config-to-tenancies` and `add-rent-charge-to-payment-submissions` are the first two migrations in the project that **alter** an existing table rather than create a new one — confirms the migration discipline holds up under that case too, not just fresh-table creation.

## 8. How to resume in a new chat

Tell Claude: *"Read PROJECT_CONTEXT.md in the project root, then let's continue."* Claude should read this whole file before touching any code, then proceed with whatever the next request is, keeping the conventions in section 5 in mind especially (they're the ones that have caused repeat bugs).

**When this file should be updated:** after any significant architectural decision, a new bug class discovered (especially ones likely to recur), or a new feature area added. Keep it as living documentation, not a one-time snapshot.
