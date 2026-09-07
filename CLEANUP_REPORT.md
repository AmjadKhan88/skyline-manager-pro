# Skyline Manager Pro — Cleanup & Restructure Report

This project was audited file-by-file (not just by folder name) to find what's
actually wired into the running app vs. what's dead weight. Both the backend
and frontend now install and **build successfully** (verified in this session).

## Critical bugs found & fixed

1. **App couldn't boot on Linux/production.** `server/src/models/index.js`
   imported `./User.model.js` and `./Building.model.js`, but the files on disk
   were `user.model.js` / `building.model.js`. Works by accident on
   case-insensitive filesystems (Mac/Windows), crashes immediately on any
   case-sensitive server. → Renamed the files to match.

2. **API calls always hit `localhost`, even in production.**
   `client/src/lib/api.ts` read `import.meta.env.VITE_API_URL`, but `.env`
   only defines `VITE_BACKEND_URL`. The real URL was silently ignored. → Fixed
   to read `VITE_BACKEND_URL`.

3. **`main.tsx` imported a file that doesn't exist**: `./context/GlobalContext.jsx`
   when the real file is `GlobalContext.tsx`. → Fixed to an extension-less import.

4. **Inconsistent API client import** — 4 real pages (`Managers`, `Settings`,
   `Employees`, `Tenants`) imported `{ api }` (named) from `lib/api.ts`, which
   only has a `default` export. This only surfaced when I ran an actual
   production build. → Fixed all 4 to the correct default import.

5. **A live component pointed at a file I removed** — `components/Home/RoleModal.tsx`
   imported the now-deleted `configs/api.js` shim. Caught by the build, fixed
   to import `lib/api.ts` directly.

## Dead code removed

**Backend** — `server.js` only ever mounts `routes/v1/*`. Everything below was
unreferenced by any route the app actually serves:
- `controllers/{auth,owner,building,employee,managers,users}/` — 6 duplicate/orphaned controller folders
- `routes/{auth,building,join,manager,owner,user}.routes.js` — 6 duplicate root-level route files
- `middlewares/{auth,join,owner,user}.middleware.js` — 4 superseded middleware files
- `models/{auth,employee,manager}.model.js` — 3 models never imported anywhere

Routes were then flattened from `routes/v1/*.js` → `routes/*.js` (API versioning
still lives at the mount path `/api/v1` in `server.js` — no need for a nested
folder when there's only one version).

**Frontend** — `App.tsx`'s router only ever renders `pages/*`. This entire tree
was a duplicate, never-routed dashboard export (looks like an earlier Figma/v0
draft that got left in place after the real pages were built):
- `components/owner/` — Dashboard, Analytics, BuildingManagement, EmployeeManagement,
  ManagerManagement, TenantManagement, FinancialReports, Notifications,
  Settings, Sidebar, StatCard, TaskManagement, its own `ui/` kit (7 files),
  and its own `figma/` folder — **~40 files total**
- `context/OwnerContext.tsx` — only consumed by the dead tree above
- `app/store.js` (Redux) + the `<Provider>` wiring in `main.tsx` — an empty
  reducer, zero `useSelector`/`useDispatch` calls anywhere in the app
- `configs/api.js` — a redundant re-export of `lib/api.ts`
- `types.ts` (root) — duplicated/conflicted with `types/index.ts` under the
  same import path; merged the 3 `ErrorBoundary*` interfaces it uniquely had
  into `types/index.ts` and deleted it
- `pages/EmailVerificationCard.jsx` — dead; `pages/auth/VerifyEmail.tsx` is the
  real, routed version
- `react-jsx-runtime.d.ts` — a hand-rolled workaround for a missing `tsconfig.json`
  and a `@types/react` version mismatch; no longer needed now both are fixed

## Structural / config fixes

- **Added `tsconfig.json` + `tsconfig.node.json`** — there was no TypeScript
  config at all despite ~140 `.tsx` files. Type errors were never actually
  being checked; Vite's esbuild was just stripping types on the fly.
- **Fixed `@types/react` (`^19`) vs `react` (`^18`) version mismatch.**
- **Removed the ~40-line manual alias hack in `vite.config.ts`.** The shadcn
  `ui/` kit had literal version numbers baked into import paths (e.g.
  `from "lucide-react@0.487.0"`) — a leftover from a Figma-Make/v0 export.
  Stripped the version suffixes from all 40 files so the real npm packages
  resolve normally, then deleted the now-unnecessary alias block.
- **Converted the last stray `.jsx` file** — or rather, deleted it, since it
  turned out to be dead code (see above). The codebase is now 100% consistent:
  JS on the backend, TypeScript on the frontend.
- **Pruned unused npm packages**: `sweetalert2`, `react-redux`,
  `@reduxjs/toolkit`, `framer-motion` (app uses `motion` instead), `next-themes`,
  `react-drag-drop-files`, `react-easy-crop`, `react-phone-number-input`,
  `react-select`, `sonner` — all either zero usages or only used inside the
  deleted dead tree.
- **Added missing `client/.gitignore` and `client/.env.example`**, and
  rewrote `server/.env.example` to list every real key from `.env` (it was
  previously missing 12 of the 15 keys).

## Architecture decisions (as your architect)

- **Backend stays plain JavaScript.** It's a clean, working Express +
  Sequelize + Postgres layout (config → models → middlewares → validators →
  services → controllers → routes). Adding TypeScript here now would add
  ceremony without fixing anything real — you asked me to remove unneeded
  complexity, not add it.
- **Frontend keeps TypeScript**, but properly configured this time. For an
  RBAC app with 4 distinct roles and a real API contract, type safety on
  props/API responses will save you real bugs as you add features — it just
  needed an actual `tsconfig.json` and consistent file extensions, which it
  now has.
- **Kept the existing role-based routing/folder shape** (`pages/{owner,manager,
  employee,tenant}/`, `layouts/*Layout.tsx`, `middleware/ProtectedRoute.tsx`) —
  it's the right shape for this app, it just had a dead duplicate sitting next
  to it. No need to reinvent it.

## What's next

The scaffold is clean and verified working (backend boots, frontend builds
with zero errors). `manager`, `employee`, and `tenant` dashboards are still
just `<Layout />` shells with no pages wired in yet — that, and any new
feature, is ready for you to hand me one at a time.
