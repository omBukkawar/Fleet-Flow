# Fleet Flow — Execution Roadmap (TODOs)

This file is the execution-ready TODO roadmap converted from the architecture document. Tasks are broken into phases, dependencies, expected outputs, critical rules, and potential failure points.

---

## Recommended Build Order
1. Foundation setup
2. Database layer
3. Backend core logic
4. Authentication & RBAC
5. Vehicle & Driver modules
6. Trip lifecycle engine
7. Maintenance & expense tracking
8. Analytics & reporting
9. Frontend implementation
10. Testing
11. Deployment & DevOps

---

## Phase Checklist (Detailed)

### PHASE 1 — Foundation setup
Goal: Repo, dev env, CI basics.
- Tasks:
  - Create folders: `/apps/frontend`, `/apps/api`, `/libs/shared`, `/infra`.  
  - Add `README.md` with quick-start commands.  
  - Add `.gitignore`, `.editorconfig`.  
  - Add `package.json` (frontend) and `requirements.txt` or `pyproject.toml` (backend).  
  - Add `Dockerfile` stubs and `docker-compose.yml` minimal.  
  - Add GitHub Actions CI skeleton to run linters.  
- Dependencies: none
- Expected output: repo scaffold + CI placeholder + compose stub
- Critical rules: reproducible local setup (`docker compose up` brings services)
- Failure points: broken Dockerfiles, CI secrets missing
- Classification: MVP

---

### PHASE 2 — Database layer
Goal: Postgres schema + migrations for core entities.
- Tasks:
  - Add Postgres to `docker-compose`.  
  - Initialize Django project and configure DB settings.  
  - Create `core` Django app and install DRF.  
  - Add models + migrations for `User`, `Role`, `Permission`.  
  - Add `Vehicle` model (UUID, license_plate unique, status enum, max_capacity).  
  - Add `Driver` model (license_expiry_date, status, safety_score).  
  - Add `Trip`, `MaintenanceLog`, `FuelLog`, `Expense`, `AuditLog` models and migrations.  
- Dependencies: Phase 1
- Expected output: DB service up + tables migrated
- Critical rules: unique constraint on `vehicle.license_plate`; UUID PKs
- Failure points: migration conflicts, enum mapping
- Classification: MVP

---

### PHASE 3 — Backend core logic
Goal: DRF API skeleton, serializers, viewsets.
- Tasks:
  - Implement serializers for User/Vehicle/Driver/Trip.  
  - Implement ModelViewSets and register routes.  
  - Add shared constants/enums in `/libs/shared`.  
  - Add pagination, filtering (django-filter).  
  - Add model-level validation hooks (`clean()` or serializer validate).  
- Dependencies: Phase 2
- Expected output: CRUD endpoints for core models
- Critical rules: server-side validation hooks present
- Failure points: inefficient queries (N+1)
- Classification: MVP

---

### PHASE 4 — Authentication & RBAC
Goal: Secure auth flows and permission enforcement.
- Tasks:
  - Install/configure `djangorestframework-simplejwt`.  
  - Add `/auth/login`, `/auth/refresh`, `/auth/logout`.  
  - Enable Argon2 password hasher (`django-argon2`).  
  - Implement `Role` + `Permission` admin UI.  
  - Implement DRF permission classes (IsFleetManager, IsDispatcher, etc.).  
  - Add AuditLog middleware to record user actions.  
  - Implement refresh token rotation and blacklist (Redis).  
- Dependencies: Phase 3
- Expected output: JWT auth + role-based guards
- Critical rules: 401 for unauthenticated, 403 for unauthorized
- Failure points: token storage / CORS misconfig
- Classification: MVP

---

### PHASE 5 — Vehicle & Driver modules
Goal: Full CRUD + business rules.
- Tasks:
  - Implement `POST /vehicles` with uniqueness check for `license_plate`.  
  - Implement vehicle status transitions (retire, in-shop).  
  - Implement `POST /drivers` with license expiry validation.  
  - Add filtered `GET /vehicles?status=Available`.  
  - Add unit tests for duplicate plate, retired assignment, expired license.  
- Dependencies: Phase 4
- Expected output: Vehicle/Driver endpoints + validations
- Critical rules: retired vehicles cannot be assigned; expired-license drivers blocked
- Failure points: race conditions on assignment (use row lock)
- Classification: MVP

---

### PHASE 6 — Trip lifecycle engine
Goal: Trip creation, validation, state machine, concurrency safety.
- Tasks:
  - Implement `POST /trips` with validations:
    - `cargo_weight <= vehicle.max_capacity`
    - `vehicle.status == Available`
    - `driver.status == On Duty`
    - `driver.license_expiry_date >= today`
  - Use DB transaction + `SELECT ... FOR UPDATE` on vehicle/driver during create.  
  - Implement `POST /trips/{id}/transition` for allowed transitions (Draft → Dispatched → On Trip → Completed → Cancelled).  
  - On transitions update vehicle.status accordingly.  
  - Emit events (Celery tasks or signals) for cache/analytics update.  
  - Unit tests for validations and transition rules.  
- Dependencies: Phase 5
- Expected output: concurrency-safe trip assignments + transitions
- Critical rules: atomic assignment; enforce capacity and statuses
- Failure points: deadlocks with poor transaction ordering
- Classification: MVP

---

### PHASE 7 — Maintenance & expense tracking
Goal: Service logs, auto-hide rule, expense aggregation.
- Tasks:
  - Implement `POST /maintenance` that creates log and sets `vehicle.status = In Shop` within same transaction.  
  - Implement `POST /maintenance/{id}/complete` that marks complete and restores `vehicle.status = Available`.  
  - Implement `POST /expenses` (fuel/misc) and link to vehicle/trip.  
  - Add `GET /vehicles/{id}/costs` to compute TotalOperationalCost and CostPerKM.  
  - Schedule Celery Beat job to compute daily summaries and write `daily_vehicle_metrics`.  
- Dependencies: Phase 6
- Expected output: maintenance flow hides vehicle; expense records exist
- Critical rules: maintenance creation must hide vehicle atomically
- Failure points: partial failure leaving inconsistent vehicle state
- Classification: MVP

---

### PHASE 8 — Analytics & reporting
Goal: KPI counters, exports, dashboards.
- Tasks:
  - Implement KPI endpoints: `GET /kpis/active_fleet`, `/kpis/utilization`, `/kpis/maintenance_alerts`.  
  - Use Redis atomic counters updated on events (trip start/end, maintenance).  
  - Implement CSV export endpoint and background job for large exports.  
  - Implement PDF generation as background job (headless Chromium).  
  - Implement `GET /analytics/fuel_efficiency` time-series endpoint.  
- Dependencies: Phase 7
- Expected output: KPI endpoints + export jobs
- Critical rules: counters must be atomic and resilient
- Failure points: export memory use; Redis counter drift
- Classification: MVP (counters), Nice-to-have (PDF)

---

### PHASE 9 — Frontend implementation
Goal: Build JS Next.js UI pages wired to APIs.
- Tasks:
  - Scaffold Next.js app (JS) + Tailwind.  
  - Implement Auth pages and token handling with HttpOnly cookies.  
  - Implement app shell + `SideNav`.  
  - Dashboard: KPI cards calling KPI endpoints.  
  - Vehicle registry page + New Vehicle modal.  
  - Driver page with license expiry indicator and lock UX.  
  - Trip dispatcher page with client-side validation and concurrency UX.  
  - Maintenance & Expense pages reflecting auto-hide.  
  - Shared UI components under `/libs/shared/ui`.  
- Dependencies: Phase 4–8
- Expected output: functioning UI for core flows
- Critical rules: UI mirrors but does not replace backend validation
- Failure points: CORS/cookie issues, auth misconfig
- Classification: MVP

---

### PHASE 10 — Testing
Goal: Unit, integration, concurrency, E2E tests; CI integration.
- Tasks:
  - Add pytest + pytest-django and unit tests for models/serializers.  
  - Add integration tests for endpoints using Django test client.  
  - Add concurrency test: simulate two trip creates to same vehicle.  
  - Frontend unit tests with Jest + React Testing Library.  
  - E2E smoke tests with Playwright/Cypress covering login → CRUD → trip lifecycle.  
  - Ensure CI runs all tests and fails on regressions.  
- Dependencies: All phases
- Expected output: CI test suite passing
- Critical rules: isolate DB state across tests; avoid flaky timing
- Failure points: flaky E2E or long-running tests in CI
- Classification: MVP

---

### PHASE 11 — Deployment & DevOps
Goal: Container images, IaC, monitoring, backups.
- Tasks:
  - Finalize `Dockerfile`s and `docker-compose.yml`.  
  - Add Terraform/Bicep for Postgres, Redis, Storage, Registry.  
  - GitHub Actions: build images, push to registry on `main`.  
  - Add k8s manifests or deploy scripts for chosen platform.  
  - Configure Prometheus + Grafana + Sentry.  
  - Configure automated DB backups and test restore.  
  - Configure HPA, readiness/liveness probes.  
- Dependencies: All code + infra creds
- Expected output: staging deployment + monitoring
- Critical rules: secure secrets; least-privilege IAM
- Failure points: misconfigured infra, secret leakage
- Classification: MVP for basic deploy; Nice-to-have for advanced rollout

---

## Business Rules → Technical Tasks (Examples)
- Prevent assigning expired-license driver:
  - Add boolean `license_valid` field + migration.  
  - Management command to update `license_valid` daily from `license_expiry_date`.  
  - Backend validation in Trip creation to check `driver.license_valid`.  
  - Unit test verifying assignment rejected.  

- Prevent duplicate license plate:
  - DB unique constraint on `vehicle.license_plate`.  
  - Serializer + unit test for duplicate plate.

- Retired vehicles cannot be assigned:
  - Check `vehicle.status != 'Retired'` during Trip creation.  
  - Unit test and API error message.

- Maintenance auto-hide rule:
  - `POST /maintenance` must create log and set `vehicle.status='In Shop'` in a single transaction.  
  - Test verifying `GET /vehicles?status=Available` excludes that vehicle immediately.

---

## Non-functional Recommendations
- Folder structure (monorepo): `/apps/frontend`, `/apps/api`, `/libs/shared`, `/infra`, `/docs`.  
- Naming conventions: API plural nouns in kebab-case; DB snake_case; Models PascalCase.  
- Git branching: `feature/`, `hotfix/`, `release/`; protect `main`.  
- CI/CD: GitHub Actions for CI; `ci.yml` for tests, `cd.yml` for build/deploy; store secrets in GitHub Secrets.

---

## Deliverables & Acceptance Criteria (per phase)
- Foundation: `docker compose up` runs DB + placeholders.  
- DB: `manage.py migrate` succeeds and tables present.  
- Backend core: health, version, and swagger endpoints return 200.  
- Auth: token issuance + protected endpoint returns 403 for insufficient role.  
- Vehicle/Driver: CRUD + tests pass.  
- Trip engine: concurrency test passes.  
- Maintenance: auto-hide verified in API + UI.  
- Analytics: KPI endpoints return expected values.  
- Frontend: manual smoke test passes for core flows.  
- Testing: CI runs and enforces tests.  
- Deployment: app reachable in staging.

---

If you'd like, I can now:
- generate a machine-readable JSON task board for import into Jira/Trello,
- scaffold a minimal `docker-compose.yml` and starter Django + Next.js skeleton,
- or create individual issue templates for the top-priority tasks.

Pick one and I'll proceed.
