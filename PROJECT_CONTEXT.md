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
│   │   │   associations.js, index.js
│   ├── shared/
│   │   ├── middlewares/  (authenticate, authorize, tenantScope, validate, errorHandler, rateLimiter, multer)
│   │   ├── utils/         (ApiResponse, asyncHandler)
│   │   └── services/      (token.service — was auth.service, email.service, cloudinary.service)
│   ├── features/
│   │   ├── auth/       (controller, routes, validator)
│   │   ├── owner/      (controller, routes)
│   │   ├── buildings/  (controller, routes)
│   │   ├── staff/      (controller, service, routes) — managers + employees
│   │   ├── tenants/    (controller, routes)
│   │   └── manager/    (controller, routes) — manager's OWN scoped dashboard/building view
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
│   ├── owner/              (Dashboard, Buildings, Managers, Employees, Tenants, Settings, Analytics*, Financial*)
│   ├── manager/            (Dashboard, Building, Employees, Tenants)
│   ├── employee/           (Dashboard, Building)
│   └── tenant/             (Dashboard, Lease)
└── types/index.ts          ← THE canonical UserRole/User/Building/Tenancy/etc. types. Never redeclare UserRole locally anywhere else.
```
*(`Analytics.tsx` and `Financial.tsx` are still visual-only placeholders — no backend endpoint exists for revenue/analytics data yet. Flagged, not yet built.)*

### Critical frontend conventions — READ BEFORE TOUCHING API CALLS OR ROUTING

1. **API paths**: `lib/api.ts`'s `baseURL` already includes `/api/v1`. Every call site must use **short paths only**: `api.get('/staff')`, `api.post('/auth/login')`. **Never** write `/api/v1/...` at a call site — this bug has recurred multiple times across regenerated files and causes silent 404s. The only exception is raw `window.location.href` redirects (e.g. Google OAuth), which aren't going through the axios instance and need the full path.
2. **`UserRole` type**: only ever import it from `'../types'` (→ `types/index.ts`). It has been wrongly redeclared locally or imported from `'../../App'` (which doesn't export it) multiple times across `Home.tsx`, `Hero.tsx`, `CTASection.tsx`, `RoleModal.tsx` — all fixed now, but if a new component needs it, import from `types`, don't reinvent it.
3. **`App.tsx` routing gotcha**: when editing routes, **edit the file, don't replace the whole `<Routes>` block** — this already caused one incident where pasting in just the new manager/employee/tenant route blocks wiped out `/`, the Owner routes, and the catch-all. The full current route tree: `/` (Home), `/verify-email`, `/change-password` (top-level, any authenticated role), then `/owner`, `/manager`, `/employee`, `/tenant` each with `ProtectedRoute` wrapping a `*Layout`, with nested `<Route index>` + named children.
4. **`ProtectedRoute` real props**: `user`, `role` (string or array), `children`, `loading`. Not `allowedRoles`. Redirects unauthorized/unauthenticated users to `/` (there's no separate `/login` route — login is the modal on Home).
5. **Response shape**: backend always returns `{ success, message, data }` (or `+pagination`). When a controller returns e.g. `{ user }`, the frontend must unwrap `res.data.data.user`, not `res.data.user`.
6. **Dark mode**: requires all three of: (a) `GlobalContext.tsx`'s `useEffect` toggling `document.documentElement.classList` + localStorage, (b) `@custom-variant dark (&:where(.dark, .dark *));` in `index.css` (Tailwind v4 requirement, easy to forget), (c) `main.tsx` importing `GlobalContext` without a wrong file extension (this import has reverted to a broken `.jsx` extension — the real file is `.tsx` — more than once across sessions; double-check it if dark mode or auth state ever "mysteriously" stops working).
7. **Sidebar state**: `sidebarOpen` (desktop collapse) and `mobileSidebarOpen` (mobile drawer) are separate concerns for separate screen sizes — never toggle both from one handler. Use `window.innerWidth >= 1024` to decide which one a menu-button click should affect.
8. Files have reverted to earlier broken states multiple times across re-uploaded zips (RoleModal, App.tsx, dead `components/owner/` tree, `configs/` folder, `types.ts` duplicate, `react-jsx-runtime.d.ts` hack). **If something that was already fixed appears broken again, check whether an old file/zip got re-merged in before assuming it's a new bug.**

## 6. Known-pending / not yet built

- `pages/owner/Analytics.tsx` and `Financial.tsx` — static placeholders, no backend endpoint yet.
- The 4 layout files (`OwnerLayout`, `ManagerLayout`, `EmployeeLayout`, `TenantLayout`) are near-duplicates — worth collapsing into one shared layout + a `useSidebarState()` hook to stop bugs from having to be fixed 4 times.
- `GET /api/v1/buildings` currently allows `authorize("owner", "manager")` but isn't scoped to just the manager's one building at that endpoint (only `/api/v1/manager/building` is properly scoped) — worth tightening.
- No automated tests anywhere yet.
- `.sequelizerc` / migrations set up but only one migration exists so far (`create-initial-schema`) — future schema changes need new migration files, not manual edits to models + hope.

## 7. How to resume in a new chat

Tell Claude: *"Read PROJECT_CONTEXT.md in the project root, then let's continue."* Claude should read this whole file before touching any code, then proceed with whatever the next request is, keeping the conventions in section 5 in mind especially (they're the ones that have caused repeat bugs).

**When this file should be updated:** after any significant architectural decision, a new bug class discovered (especially ones likely to recur), or a new feature area added. Keep it as living documentation, not a one-time snapshot.
