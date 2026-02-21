import { VehicleStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, StateTransitionError, ValidationError } from '../errors/DomainError';

export class VehicleService {
    /**
     * Defines allowed status transitions for a Vehicle.
     */
    private static readonly ALLOWED_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
        [VehicleStatus.AVAILABLE]: [VehicleStatus.ON_TRIP, VehicleStatus.IN_SHOP, VehicleStatus.RETIRED],
        [VehicleStatus.ON_TRIP]: [VehicleStatus.AVAILABLE, VehicleStatus.RETIRED],
        [VehicleStatus.IN_SHOP]: [VehicleStatus.AVAILABLE, VehicleStatus.RETIRED],
        [VehicleStatus.RETIRED]: [], // Terminal state
    };

    /**
     * Validates if a transition is allowed.
     */
    public static canTransition(current: VehicleStatus, target: VehicleStatus): boolean {
        if (current === target) return true; // Idempotent
        return this.ALLOWED_TRANSITIONS[current]?.includes(target);
    }

    /**
     * Update the status of a vehicle with strict domain validation.
     * Can accept an existing Prisma transaction client for atomic operations.
     */
    public static async updateStatus(
        id: string,
        newStatus: VehicleStatus,
        tx: Prisma.TransactionClient = prisma
    ) {
        const vehicle = await tx.vehicle.findUnique({ where: { id } });

        if (!vehicle) {
            throw new NotFoundError(`Vehicle with id ${id} not found.`);
        }

        if (!this.canTransition(vehicle.status, newStatus)) {
            throw new StateTransitionError('Vehicle', vehicle.status, newStatus);
        }

        return tx.vehicle.update({
            where: { id },
            data: { status: newStatus },
        });
    }

    /**
     * Retire a vehicle (Irreversible operation)
     */
    public static async retireVehicle(id: string) {
        return this.updateStatus(id, VehicleStatus.RETIRED);
    }
}
