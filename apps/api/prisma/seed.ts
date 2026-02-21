import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing old data...');
    // Delete in reverse order of relationships to maintain referential integrity
    await prisma.auditLog.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.fuelLog.deleteMany();
    await prisma.maintenanceLog.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.driver.deleteMany();

    console.log('Seeding minimal test data...');

    // 1. Roles & Permissions (Not natively supported by Enum in DB layer but we can map Permissions to roles)
    const permDispatch = await prisma.permission.create({
        data: { name: 'CAN_DISPATCH_TRIP', description: 'Allowed to create and dispatch trips' }
    });

    const permFleet = await prisma.permission.create({
        data: { name: 'CAN_MANAGE_FLEET', description: 'Allowed to CRUD vehicles and drivers' }
    });

    await prisma.rolePermission.createMany({
        data: [
            { role: 'DISPATCHER', permissionId: permDispatch.id },
            { role: 'FLEET_MANAGER', permissionId: permFleet.id },
            { role: 'ADMIN', permissionId: permDispatch.id },
            { role: 'ADMIN', permissionId: permFleet.id },
        ]
    });

    // 2. Users
    // password: "password123" (Not hashed here for brevity of seed scripts but will be via Argon2 in auth phase)
    await prisma.user.createMany({
        data: [
            { email: 'admin@fleetflow.com', name: 'Admin Flow', password: 'password123', role: 'ADMIN' },
            { email: 'manager@fleetflow.com', name: 'Fleet Manager', password: 'password123', role: 'FLEET_MANAGER' },
            { email: 'dispatcher@fleetflow.com', name: 'Dave Dispatch', password: 'password123', role: 'DISPATCHER' },
        ]
    });

    // 3. Vehicles
    const v1 = await prisma.vehicle.create({
        data: {
            licensePlate: 'ABC-1234',
            make: 'Ford',
            model: 'Transit 250',
            year: 2023,
            maxCapacity: 1500.0, // kgs
            status: 'AVAILABLE'
        }
    });

    const v2 = await prisma.vehicle.create({
        data: {
            licensePlate: 'XXX-0000',
            make: 'Mercedes',
            model: 'Sprinter',
            year: 2021,
            maxCapacity: 2500.0,
            status: 'RETIRED'
        }
    });

    // 4. Drivers
    // One valid, one expired
    const d1 = await prisma.driver.create({
        data: {
            licenseNumber: 'DL-001',
            name: 'John Doe',
            phone: '+1-555-1234',
            licenseExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // 2 years valid
            licenseValid: true,
            status: 'ON_DUTY'
        }
    });

    const d2 = await prisma.driver.create({
        data: {
            licenseNumber: 'DL-002',
            name: 'Alice Expired',
            phone: '+1-555-9999',
            licenseExpiryDate: new Date('2022-01-01'), // heavily expired
            licenseValid: false,
            status: 'ON_DUTY'
        }
    });

    // 5. Trip stub
    await prisma.trip.create({
        data: {
            vehicleId: v1.id,
            driverId: d1.id,
            cargoWeight: 1000.0,
            status: 'DRAFT',
            origin: 'Warehouse A',
            destination: 'Central Hub',
        }
    });

    console.log('Database seeding complete. ✔️');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
