# Fleet Flow

Fleet Flow is a high-performance backend architecture built with Node.js, Express, Prisma, and PostgreSQL.

## Folder Structure

- `/apps/api`: Main backend service (Node.js + Express)
- `/apps/frontend`: Missing for now (React UI planned)
- `/libs/shared`: Used for shared logic/configs across applications
- `/infra`: Docker, K8s, Terraform scripts and resources (placeholder)

## Quick Start (Docker)

1. Make sure you have Docker and Docker Compose installed.
2. Run the application using Docker Compose:
   ```bash
   docker compose up --build
   ```
3. The API will be available at `http://localhost:3000/`. The healthcheck endpoint is at `http://localhost:3000/health`.

## Run Locally (without Docker API)

If you only want to run the database in Docker and the API locally on your machine:

1. Bring up the Postgres DB snippet from the root:
   ```bash
   docker compose up db -d
   ```
2. Navigate to the `apps/api` folder:
   ```bash
   cd apps/api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```

## Next Steps

We are ready to proceed to Phase 2 (Database Layer) to define our Core Models and run the DB migrations.
