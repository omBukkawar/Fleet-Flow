# Fleet Flow — Recommended Technical Stack (detailed)

This document maps concrete technology choices to the functional and non-functional requirements in `project requirements.md` and the UI flows in `ui.md`.

## Summary (top-level)
- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Backend: Node.js + NestJS (TypeScript) — REST API with OpenAPI
- Database: PostgreSQL (primary), TimescaleDB extension optional for time-series analytics
- Caching / Queue: Redis + BullMQ
- Auth & Security: JWT (access + refresh), Argon2 for password hashing, RBAC (policy-based)
- Observability: Prometheus + Grafana, Sentry
- Deploy: Docker + Kubernetes (or Azure Container Apps / AWS ECS) with CI/CD via GitHub Actions

## Rationale vs requirements
- ACID DB and complex relational queries → PostgreSQL: supports transactions, indexes, ACID guarantees, and rich SQL for analytics.
- Performance ≤300ms 95th pct & support 10k+ vehicles → stateless API workers (NestJS) behind autoscaling, Redis for caching hot counters, and DB connection pooling.
- JWT + RBAC + password hashing → standard secure flows; Argon2 or bcrypt for passwords; enforce 403s at API layer.
- Audit logging → use a dedicated `audit_logs` table and integrate application-level middleware to record changes (user, action, entity, id, timestamp).
- Exporting CSV/PDF and analytics → Postgres for aggregates; generate CSV server-side; use an HTML-to-PDF service (wkhtmltopdf or a headless Chromium step) for PDF exports.

## Frontend (detailed)
- Framework: Next.js 14 (or stable LTS) + React + TypeScript
- Styling: Tailwind CSS (fast dev) + component library (Headless UI / Radix + custom components)
- State management: React Query (TanStack Query) for server state and caching; Zustand for local UI state if needed
- Charts: Recharts or Chart.js (or use Vega-Lite for richer visualizations)
- Auth: Secure cookie (HttpOnly) for refresh token + in-memory access token for API calls (or same-site cookies for both tokens)
- Accessibility: follow WCAG basics; ensure table and modal components are keyboard-accessible

## Backend (detailed)
- Framework: NestJS (TypeScript) — modular, DI, decorators make RBAC and validation straightforward
- API style: RESTful endpoints + OpenAPI (Swagger) docs; consider GraphQL for complex queries later
- Validation: class-validator / DTOs in NestJS
- Passwords: argon2 (argon2id) via npm `argon2` package
- Auth: JWT with short-lived access tokens + refresh tokens stored as HttpOnly secure cookies; token revocation stored in DB or Redis
- RBAC: Use a policy-based approach (roles + permissions) stored in DB; enforce at controller/guard level
- Background jobs: BullMQ + Redis for long-running tasks (report generation, CSV export, notifications)
- File uploads: store receipts/images in object storage (S3-compatible or Azure Blob); keep references in DB

## Database & schema notes
- Primary: PostgreSQL 14+; use UUIDs for primary keys (pgcrypto uuid_generate_v4)
- Core tables: users, roles, role_permissions, vehicles, drivers, trips, maintenance_logs, fuel_logs, expenses, audit_logs
- Indexing: compound indexes on (status, vehicle_type, region) for fast dashboard filters
- Metrics tables: store pre-aggregated daily summaries for heavy analytics (Materialized views or a nightly job)
- Backups: nightly pg_dump or managed DB automated backups; test restore regularly

## Caching, Queues & Scaling
- Redis for caching counters (Active Fleet), session/refresh token blacklists, and job queue backend
- Queue: BullMQ for report generation, data exports, and heavy background tasks
- Horizontal scale: containerize app, use HPA in Kubernetes; scale DB vertically and use read replicas for heavy read workloads (analytics)

## Observability & Ops
- Metrics: Prometheus scraping app and DB metrics; Grafana dashboards showing 95th latency, query times, error rate, queue sizes
- Traces & Errors: Sentry for exceptions; OpenTelemetry for traces (optional)
- Logs: structured JSON logs shipped to ELK/LogDNA/CloudWatch
- CI/CD: GitHub Actions pipeline: lint, test, build, containerize, push to registry, run deployment job
- Infra as Code: Terraform or Bicep for provisioning DB, Redis, Object Storage, and Kubernetes clusters

## Security & Compliance
- Enforce input validation and parameterized queries (ORM + query builder) to prevent SQL injection
- Use HTTPS, HSTS, secure cookies, CSP headers
- Rate limiting at API gateway (NGINX or API Gateway) and per-user quotas for sensitive endpoints
- Role-based access checks in service layer and controller guards

## Third-party services & libs (examples)
- Auth: `argon2`, `jsonwebtoken`, `passport-jwt` (or NestJS JWT module)
- ORM: TypeORM or Prisma (Prisma recommended for DX + typed queries)
- Queue: `bullmq` + `ioredis`
- Testing: Jest (unit), Supertest (integration)
- Linting & formatting: ESLint + Prettier + Husky pre-commit hooks
- Monitoring: `prom-client` for Prometheus metrics
- Error tracking: Sentry SDK

## Data model & API considerations mapped to UI
- Dashboard KPIs: maintain small aggregated counters in Redis updated on state transitions (trip start/complete, maintenance in/out)
- Trip validation rules: enforce in the backend service (capacity, vehicle status, driver license) and mirror checks client-side to improve UX
- Maintenance auto-hide rule: on service create job, mark vehicle `In Shop` and emit event to queue to update caches and notify dispatcher
- Exports: generate CSV from DB query; for PDF use server-side renderer or headless Chromium job

## Dev workflow & quick-start dev stack
- Local dev: Docker Compose with PostgreSQL, Redis, and Node app
- Scripts: `npm run dev` (frontend), `npm run start:dev` (backend), `docker compose up` for full local stack

## Suggested folder & repo structure (monorepo option)
- /apps/frontend (Next.js)
- /apps/api (NestJS)
- /libs/shared (types, DTOs, utilities)
- /infra (terraform/bicep, k8s manifests)

## Next steps & recommendations
- Choose Prisma or TypeORM now (Prisma recommended for faster iteration)
- Scaffold backend with NestJS modules: Auth, Users, Vehicles, Trips, Maintenance, Expenses, Analytics
- Create a minimal CI pipeline that runs tests and builds Docker images
- Implement audit middleware before adding complex analytics

---

If you want, I can also:
- generate a starter `docker-compose.yml` for local development,
- scaffold a minimal NestJS project with the core modules,
- or produce a JSON machine-readable tech stack for tooling.
