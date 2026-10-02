# Skyline Manager Pro — Project Context / Memory File

> **For a future Claude session:** Read this file first, in full, before doing anything else on this project. It contains the full history, architecture, conventions, and known-pending items. Anthropic's cross-chat memory is not enabled for this user, so this file is the actual persistence layer between sessions — keep it updated as the source of truth.

**Last updated:** during active build session, covering everything from initial cleanup through the owner dashboard redesign + sidebar fixes.

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
│   │   │   MaintenanceRequest.model.js, Announcement.model.js, Document.model.js, associations.js, index.js
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
│   │   └── documents/ (controller, routes, validator) — lease/ID/inspection storage, see section 6f
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
│   ├── owner/              (Dashboard, Buildings, Managers, Employees, Tenants, Settings, Analytics, Financial, Maintenance, Announcements)
│   ├── manager/            (Dashboard, Building, Employees, Tenants, Maintenance, Announcements)
│   ├── employee/           (Dashboard, Building, Maintenance, Announcements)
│   └── tenant/             (Dashboard, Lease, Maintenance, Announcements)
├── lib/maintenanceStyles.ts  ← shared category/priority/status badge config, used by all 4 Maintenance pages
├── lib/announcementStyles.ts ← shared priority badge config, used by all 4 Announcements pages
└── types/index.ts          ← THE canonical UserRole/User/Building/Tenancy/etc. types. Never redeclare UserRole locally anywhere else.
```
All pages listed are real and wired to the backend — `Analytics`/`Financial` were placeholders earlier in the project but are now built (see 6b), as is `Maintenance` (see 6d) and `Announcements` (see 6e).

### Critical frontend conventions — READ BEFORE TOUCHING API CALLS OR ROUTING

1. **API paths**: `lib/api.ts`'s `baseURL` already includes `/api/v1`. Every call site must use **short paths only**: `api.get('/staff')`, `api.post('/auth/login')`. **Never** write `/api/v1/...` at a call site — this bug has recurred multiple times across regenerated files and causes silent 404s. The only exception is raw `window.location.href` redirects (e.g. Google OAuth), which aren't going through the axios instance and need the full path.
2. **`UserRole` type**: only ever import it from `'../types'` (→ `types/index.ts`). It has been wrongly redeclared locally or imported from `'../../App'` (which doesn't export it) multiple times across `Home.tsx`, `Hero.tsx`, `CTASection.tsx`, `RoleModal.tsx` — all fixed now, but if a new component needs it, import from `types`, don't reinvent it.
3. **`App.tsx` routing gotcha**: when editing routes, **edit the file, don't replace the whole `<Routes>` block** — this already caused one incident where pasting in just the new manager/employee/tenant route blocks wiped out `/`, the Owner routes, and the catch-all. The full current route tree: `/` (Home), `/verify-email`, `/change-password` (top-level, any authenticated role), then `/owner`, `/manager`, `/employee`, `/tenant` each with `ProtectedRoute` wrapping a `*Layout`, with nested `<Route index>` + named children.
4. **`ProtectedRoute` real props**: `user`, `role` (string or array), `children`, `loading`. Not `allowedRoles`. Redirects unauthorized/unauthenticated users to `/` (there's no separate `/login` route — login is the modal on Home).
5. **Response shape**: backend always returns `{ success, message, data }` (or `+pagination`). When a controller returns e.g. `{ user }`, the frontend must unwrap `res.data.data.user`, not `res.data.user`.
6. **Dark mode**: requires all three of: (a) `GlobalContext.tsx`'s `useEffect` toggling `document.documentElement.classList` + localStorage, (b) `@custom-variant dark (&:where(.dark, .dark *));` in `index.css` (Tailwind v4 requirement, easy to forget), (c) `main.tsx` importing `GlobalContext` without a wrong file extension (this import has reverted to a broken `.jsx` extension — the real file is `.tsx` — more than once across sessions; double-check it if dark mode or auth state ever "mysteriously" stops working).
7. **Sidebar state**: `sidebarOpen` (desktop collapse) and `mobileSidebarOpen` (mobile drawer) are separate concerns for separate screen sizes — never toggle both from one handler. Use `window.innerWidth >= 1024` to decide which one a menu-button click should affect.
8. Files have reverted to earlier broken states multiple times across re-uploaded zips (RoleModal, App.tsx, dead `components/owner/` tree, `configs/` folder, `types.ts` duplicate, `react-jsx-runtime.d.ts` hack). **If something that was already fixed appears broken again, check whether an old file/zip got re-merged in before assuming it's a new bug.**

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

## 7. Known-pending / not yet built

- The 4 layout files (`OwnerLayout`, `ManagerLayout`, `EmployeeLayout`, `TenantLayout`) are near-duplicates — **now proven, not just suspected**, to cause repeat bugs (the sidebar-toggle fix had to be applied 4 separate times). Collapsing into one shared layout + a `useSidebarState()` hook should be a near-term priority, not just a nice-to-have.
- `Managers.tsx` and `Employees.tsx` are now near-identical — candidate for a shared `StaffTable` component. The employee/tenant `Announcements.tsx` pages are now in the same boat (identical logic, copy-pasted).
- Sidebar's "Upgrade Plan" card (Step 1) is still static copy — should pull the real `subscriptionPlan` from `/owner/profile` once we're back in that area.
- Settings' "Upgrade Plan" button is a no-op — no billing/payment feature exists yet.
- A proper audit-log table (tracking real events like status changes, not just record creation) would let the dashboard's activity timeline and any future "recent activity" feature be genuinely complete rather than synthesized from creation timestamps — Maintenance (6d) and now Announcements (6e) are both real, timestamped event sources that could feed this instead.
- Dashboard/Analytics activity feeds could now incorporate real `MaintenanceRequest`/`Announcement` events, not just buildings/staff/tenants creation timestamps — natural next polish item.
- `GET /api/v1/buildings` currently allows `authorize("owner", "manager")` but isn't scoped to just the manager's one building at that endpoint (only `/api/v1/manager/building` is properly scoped) — worth tightening.
- Remaining researched features not yet built, roughly in priority order: **document storage** (lease PDFs, ID documents), **online rent payment** (Stripe — would also finally enable a real historical revenue trend chart, since it creates dated transaction records), **expense tracking** (Financial currently only tracks revenue, not the cost side), vendor/contractor accounts, lease e-signature, move-in/move-out inspection checklists.
- No automated tests anywhere yet.
- `.sequelizerc` / migrations set up — now 3 migrations exist (`create-initial-schema`, `create-maintenance-requests`, `create-announcements`) — future schema changes need new migration files, not manual edits to models + hope.

## 8. How to resume in a new chat

Tell Claude: *"Read PROJECT_CONTEXT.md in the project root, then let's continue."* Claude should read this whole file before touching any code, then proceed with whatever the next request is, keeping the conventions in section 5 in mind especially (they're the ones that have caused repeat bugs).

**When this file should be updated:** after any significant architectural decision, a new bug class discovered (especially ones likely to recur), or a new feature area added. Keep it as living documentation, not a one-time snapshot.
