# Fleet Lifecycle & Operations Management System

## Project Requirement Document

------------------------------------------------------------------------

# 1. Introduction

## 1.1 Purpose

Build a centralized, rule-driven digital system to replace manual fleet
logbooks.

The system must: - Track complete vehicle lifecycle - Enforce driver
compliance - Prevent invalid dispatch decisions - Monitor operational
and financial performance - Provide decision-grade analytics

This is an operational control system with enforced logic and automated
state transitions.

------------------------------------------------------------------------

## 1.2 Scope

The system will manage: - Fleet assets (vehicles) - Drivers - Trips -
Maintenance - Fuel & expenses - Compliance - Financial analytics

Out of Scope (v1): - GPS live tracking - External accounting
integration - Third-party telematics APIs

------------------------------------------------------------------------

# 2. Stakeholders & User Roles

## 2.1 Fleet Manager

-   Manage vehicle registry
-   Approve/monitor maintenance
-   View KPIs and financial reports
-   Mark vehicles retired/out of service

## 2.2 Dispatcher

-   Create trips
-   Assign drivers and vehicles
-   Monitor trip lifecycle
-   Validate cargo constraints

## 2.3 Safety Officer

-   Monitor license validity
-   Track safety scores
-   Suspend drivers
-   View compliance alerts

## 2.4 Financial Analyst

-   Audit fuel & maintenance expenses
-   Analyze ROI
-   Export financial reports

------------------------------------------------------------------------

# 3. Functional Requirements

## 3.1 Authentication & Authorization

### 3.1.1 Login System

-   Email + password authentication
-   Password hashing (bcrypt/argon2)
-   Forgot password workflow

### 3.1.2 Role-Based Access Control (RBAC)

-   Enforce feature-level permission checks
-   Return HTTP 403 for unauthorized actions

------------------------------------------------------------------------

## 3.2 Command Center Dashboard

### KPIs

-   Active Fleet (Status = On Trip)
-   Maintenance Alerts (Status = In Shop)
-   Utilization Rate
-   Pending Cargo (Unassigned trips)

Utilization Formula:

Utilization = (On Trip Vehicles / Total Available Vehicles) × 100

### Filters

-   Vehicle Type
-   Status
-   Region

------------------------------------------------------------------------

## 3.3 Vehicle Registry (Asset Management)

### Data Fields

-   Vehicle ID (UUID)
-   Name / Model
-   License Plate (Unique)
-   Vehicle Type
-   Max Load Capacity
-   Acquisition Cost
-   Odometer
-   Status (Available, On Trip, In Shop, Retired)

### Business Rules

-   License plate must be unique
-   Retired vehicles cannot be assigned or serviced

------------------------------------------------------------------------

## 3.4 Trip Dispatcher & Management

### Trip Creation Fields

-   Origin
-   Destination
-   Cargo Weight
-   Selected Vehicle
-   Selected Driver
-   Expected Revenue

### Validation Rules

1.  CargoWeight \<= Vehicle.MaxCapacity
2.  Vehicle.Status = Available
3.  Driver.Status = On Duty
4.  Driver.LicenseValid = True

### Lifecycle

Draft → Dispatched → Completed → Cancelled

------------------------------------------------------------------------

## 3.5 Maintenance & Service Logs

### Log Fields

-   Vehicle ID
-   Service Type
-   Cost
-   Date
-   Description

### Automated Logic

-   On service creation → Vehicle.Status = In Shop
-   On service completion → Vehicle.Status = Available

------------------------------------------------------------------------

## 3.6 Fuel & Expense Logging

### Fuel Entry Fields

-   Vehicle ID
-   Liters
-   Cost
-   Date
-   Odometer Reading

### Derived Metrics

Fuel Efficiency: Efficiency = Distance / Liters

Operational Cost: Total Cost = Sum(Fuel Cost + Maintenance Cost)

Cost per KM: CostPerKM = Total Operational Cost / Total Distance

------------------------------------------------------------------------

## 3.7 Driver Performance & Safety

### Driver Fields

-   Name
-   License Number
-   License Category
-   License Expiry Date
-   Status (On Duty, Off Duty, Suspended)
-   Safety Score (0--100)

### Compliance Logic

If current_date \> LicenseExpiry: - Driver.Status = Suspended -
Assignment blocked

### Performance Metrics

-   Trip Completion Rate
-   On-time Completion %
-   Safety Score

------------------------------------------------------------------------

## 3.8 Operational Analytics

### Metrics

-   Fuel Efficiency (km/L)
-   Vehicle ROI
-   Fleet Utilization %
-   Cost per KM
-   Downtime %

ROI Formula: ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost

### Export

-   CSV
-   PDF
-   Monthly summary

------------------------------------------------------------------------

# 4. Non-Functional Requirements

## Performance

-   API response time \< 300ms (95th percentile)
-   Dashboard load \< 2 seconds

## Scalability

-   Support 10,000+ vehicles
-   Support 100 concurrent users

## Security

-   JWT authentication
-   Password hashing
-   Input validation
-   SQL injection prevention
-   Audit logging

## Reliability

-   ACID-compliant database
-   Soft deletes
-   Daily backups

------------------------------------------------------------------------

# 5. System Architecture

## Architecture Style

3-tier architecture: Frontend → REST API → Relational DB

## Suggested Tech Stack

Frontend: - React / Next.js

Backend: - Node.js (Express) or Django - REST API - JWT Authentication

Database: - PostgreSQL or MySQL

------------------------------------------------------------------------

# 6. Database Design (High-Level)

Tables: - Users - Roles - Vehicles - Drivers - Trips - MaintenanceLogs -
FuelLogs - Expenses

Relationships: - Trip → Vehicle (Many-to-One) - Trip → Driver
(Many-to-One) - MaintenanceLog → Vehicle - FuelLog → Vehicle

------------------------------------------------------------------------

# 7. Audit & Logging

Audit must store: - User ID - Timestamp - Action - Entity Type - Entity
ID

------------------------------------------------------------------------

# 8. Success Criteria

System is successful if: - No invalid dispatch occurs - No expired
license driver is assigned - Cost per KM is accurate - Manual logs
eliminated

------------------------------------------------------------------------

# 9. Future Enhancements

-   GPS tracking
-   Predictive maintenance
-   Fuel anomaly detection
-   ERP integration
-   Mobile driver app
