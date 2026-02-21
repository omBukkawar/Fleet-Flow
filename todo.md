# FleetFlow Implementation Todo List

## 1. Project Setup
- [ ] **Backend (Django)**
  - [ ] Initialize Django project and app (`fleetflow`).
  - [ ] Configure PostgreSQL database connection.
  - [ ] Set up Django REST Framework (DRF) and `django-cors-headers`.
  - [ ] Set up `SimpleJWT` for authentication.
- [ ] **Frontend (React + Vite)**
  - [ ] Initialize Vite React project.
  - [ ] Install dependencies (React Router v6, Tailwind CSS, Axios, Recharts, Lucide-React).
  - [ ] Setup initial folder structure (components, pages, utils, hooks).

## 2. Authentication & Authorization
- [ ] **Backend**
  - [ ] Extend built-in User model to include `role` (Manager, Dispatcher, Safety Officer, Analyst).
  - [ ] Create Login and Registration API endpoints.
  - [ ] Implement Role-Based Access Control (RBAC) permissions.
- [ ] **Frontend**
  - [ ] Build Login/Registration UI pages.
  - [ ] Implement global state (Zustand/Context API) for user sessions.
  - [ ] Set up protected routes based on user roles.

## 3. Vehicle Registry (Asset Management)
- [ ] **Backend**
  - [ ] Create `Vehicle` model (License Plate, Model, Type, Max Payload, Odometer, Status).
  - [ ] Build CRUD API endpoints for Vehicles.
- [ ] **Frontend**
  - [ ] Build Vehicle Registry Dashboard UI (data table with NO, Plate, Model, Type, Capacity, Odometer, Status).
  - [ ] Implement Search, Filter, and Group by functionality.
  - [ ] Build "New Vehicle Registration" modal form.
  - [ ] Integrate API to create, read, update, and delete vehicles.

## 4. Driver Performance & Safety Profiles
- [ ] **Backend**
  - [ ] Create `Driver` model (Name, License#, Expiry Date, Safety Score, Completion Rate, Complaints, Duty Status).
  - [ ] Build CRUD API endpoints for Drivers.
- [ ] **Frontend**
  - [ ] Build Driver Profiles Dashboard UI (data table for driver stats).
  - [ ] Implement Search, Filter, and Sort by functionality.
  - [ ] Build driver duty status toggle UI.
  - [ ] Integrate API for driver management.

## 5. Maintenance & Service Logs
- [ ] **Backend**
  - [ ] Create `MaintenanceLog` model (Vehicle ForeignKey, Issue/Service, Date, Cost, Status).
  - [ ] Build API endpoints for creating and viewing maintenance logs.
  - [ ] **Critical Logic**: Implement Django Signal for the "Auto-Hide" rule (automatically mark Vehicle status as "In Shop" when a new log is created).
- [ ] **Frontend**
  - [ ] Build Service Log Dashboard UI (table: Log ID, Vehicle, Issue/Service, Date, Cost, Status).
  - [ ] Build "New Service" modal form.
  - [ ] Integrate API to create and view logs.

## 6. Trip Dispatcher & Management
- [ ] **Backend**
  - [ ] Create `Trip` model (Vehicle FK, Driver FK, Cargo Weight, Origin, Destination, Estimated Fuel Cost, Status).
  - [ ] Build API endpoints for active trips and creating new trips.
  - [ ] **Critical Logic**: Implement "License Expiry Lock" (Prevent assigning drivers with expired licenses).
  - [ ] **Critical Logic**: Implement "Cargo Weight Lock" (Reject creation if `Cargo Weight > Vehicle Max Payload`).
- [ ] **Frontend**
  - [ ] Build Dispatcher UI split horizontally (Active Trips table on top, New Trip form on bottom).
  - [ ] Implement New Trip form fields (Select Vehicle, Cargo Weight, Select Driver, Origin, Destination, Est Fuel Cost).
  - [ ] Display graceful UI validation errors if weight exceeds max payload or driver license is expired.
  - [ ] Integrate API to fetch available vehicles/drivers and dispatch trips.

## 7. Expense & Fuel Logging (Completed Trips)
- [ ] **Backend**
  - [ ] Create `ExpenseLog` model (Trip FK, Vehicle FK, Fuel Liters, Fuel Cost, Misc Expense, Date).
  - [ ] Build API endpoints to record expenses.
  - [ ] Implement automated calculation of "Total Operational Cost" per vehicle.
- [ ] **Frontend**
  - [ ] Build Expense & Fuel Logging Dashboard UI (table: Trip ID, Driver, Distance, Fuel Expense, Misc Expense, Status).
  - [ ] Build "New Expense" input side-modal.
  - [ ] Integrate API to log receipts and complete trips.

## 8. Main Dashboard (Command Center)
- [ ] **Backend**
  - [ ] Build Dashboard API endpoint to aggregate KPIs (Active Fleet, Maintenance Alerts, Utilization Rate, Pending Cargo).
  - [ ] Feed real-time active trips to the dashboard data table.
- [ ] **Frontend**
  - [ ] Build Main Dashboard UI with Top Bar, Search, and Action buttons.
  - [ ] Implement the 3 Large KPI Cards (Active Fleet, Maintenance Alert, Pending Cargo).
  - [ ] Build Data Table showing real-time trip details (Trip, Vehicle, Driver, Status).
  - [ ] Implement Side Navigation Menu for seamless routing across the app.

## 9. Operational Analytics & Financial Reports
- [ ] **Backend**
  - [ ] Build Analytics API endpoint for graph data calculation.
  - [ ] **Critical Logic**: Calculate Fuel Efficiency (km/L) per vehicle.
  - [ ] **Critical Logic**: Calculate Vehicle ROI: `(Revenue - (Maintenance + Fuel)) / Acquisition Cost`.
  - [ ] Implement export functionality (CSV/PDF) for reporting.
- [ ] **Frontend**
  - [ ] Build Analytics Dashboard UI (KPI cards for Total Fuel Cost, Fleet ROI, Utilization Rate).
  - [ ] Integrate `Recharts` to build "Fuel Efficiency Trend" line graph and "Top 5 Costliest Vehicles" bar chart.
  - [ ] Build "Financial Summary of Month" data table.
  - [ ] Implement One-click Report Export functionality.
