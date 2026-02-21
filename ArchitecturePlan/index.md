# Fleet Flow — Docs Index

This index summarizes and links the two key docs in this folder: the project requirements and the UI overview.

- Project Requirements: [ArchitecturePlan/project requirements.md](ArchitecturePlan/project requirements.md)
  - 1. Introduction — Purpose, scope, high-level goals
  - 2. Stakeholders & User Roles — Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
  - 3. Functional Requirements — Auth, Dashboard, Vehicle Registry, Trip Dispatcher, Maintenance, Fuel & Expenses, Driver Performance, Analytics
  - 4. Non-Functional Requirements — Performance, Scalability, Security, Reliability
  - 5. System Architecture — 3-tier, suggested techs (React/Next.js, Node/Django, PostgreSQL)
  - 6. Database Design — Core tables (Users, Roles, Vehicles, Drivers, Trips, MaintenanceLogs, FuelLogs, Expenses)
  - 7. Audit & Logging — audit fields and retention
  - 8. Success Criteria — business acceptance conditions
  - 9. Future Enhancements — GPS, predictive maintenance, mobile app

- UI Overview: [ArchitecturePlan/ui.md](ArchitecturePlan/ui.md)
  - Authentication — login/register, role toggle
  - Main Dashboard — KPI cards, filters, table, primary actions (`New Trip`, `New Vehicle`)
  - Vehicle Registry — add/edit vehicles, registration modal, asset table
  - Trip Dispatcher — trip form, validation rules, lifecycle (Draft → Dispatched → Completed → Cancelled)
  - Maintenance & Service Logs — service modal, auto-hide rule (vehicle → In Shop)
  - Expense & Fuel Logging — expense modal, aggregations, reports
  - Driver Performance & Safety — license expiry lock, safety score, duty toggle
  - Operational Analytics & Reports — fuel efficiency, ROI, exports (CSV/PDF)

How to use this index
- Quick jump: open either file above to read full sections.
- Use this index as a checklist when implementing UI flows and API endpoints.

If you want, I can also generate a machine-readable JSON index (headings + line ranges) for search/indexing services.
# Fleet Flow — Docs Index

This index summarizes and links the two key docs in this folder: the project requirements and the UI overview.

- Project Requirements: [vibe-docs/project requirements.md](vibe-docs/project requirements.md)
  - 1. Introduction — Purpose, scope, high-level goals
  - 2. Stakeholders & User Roles — Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
  - 3. Functional Requirements — Auth, Dashboard, Vehicle Registry, Trip Dispatcher, Maintenance, Fuel & Expenses, Driver Performance, Analytics
  - 4. Non-Functional Requirements — Performance, Scalability, Security, Reliability
  - 5. System Architecture — 3-tier, suggested techs (React/Next.js, Node/Django, PostgreSQL)
  - 6. Database Design — Core tables (Users, Roles, Vehicles, Drivers, Trips, MaintenanceLogs, FuelLogs, Expenses)
  - 7. Audit & Logging — audit fields and retention
  - 8. Success Criteria — business acceptance conditions
  - 9. Future Enhancements — GPS, predictive maintenance, mobile app

- UI Overview: [vibe-docs/ui.md](vibe-docs/ui.md)
  - Authentication — login/register, role toggle
  - Main Dashboard — KPI cards, filters, table, primary actions (`New Trip`, `New Vehicle`)
  - Vehicle Registry — add/edit vehicles, registration modal, asset table
  - Trip Dispatcher — trip form, validation rules, lifecycle (Draft → Dispatched → Completed → Cancelled)
  - Maintenance & Service Logs — service modal, auto-hide rule (vehicle → In Shop)
  - Expense & Fuel Logging — expense modal, aggregations, reports
  - Driver Performance & Safety — license expiry lock, safety score, duty toggle
  - Operational Analytics & Reports — fuel efficiency, ROI, exports (CSV/PDF)

How to use this index
- Quick jump: open either file above to read full sections.
- Use this index as a checklist when implementing UI flows and API endpoints.

If you want, I can also generate a machine-readable JSON index (headings + line ranges) for search/indexing services.