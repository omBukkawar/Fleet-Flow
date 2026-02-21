import { DriverStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, StateTransitionError, ValidationError } from '../errors/DomainError';

export class DriverService {
    /**
     * Defines allowed status transitions for a Driver.
     */
    private static readonly ALLOWED_TRANSITIONS: Record<DriverStatus, DriverStatus[]> = {
        [DriverStatus.ON_DUTY]: [DriverStatus.ON_TRIP, DriverStatus.OFF_DUTY, DriverStatus.SUSPENDED],
        [DriverStatus.OFF_DUTY]: [DriverStatus.ON_DUTY, DriverStatus.SUSPENDED],
        [DriverStatus.ON_TRIP]: [DriverStatus.ON_DUTY, DriverStatus.SUSPENDED],
        [DriverStatus.SUSPENDED]: [DriverStatus.ON_DUTY, DriverStatus.OFF_DUTY], // Can be unsuspended to duty
    };

    /**
     * Validates if a transition is allowed based on the allowed transitions map.
     */
    public static canTransition(current: DriverStatus, target: DriverStatus): boolean {
        if (current === target) return true;
        return this.ALLOWED_TRANSITIONS[current]?.includes(target);
    }

    /**
     * Update the status of a driver with strict domain validation.
     * Accepts an existing Prisma transaction client for nested transactional operations.
     */
    public static async updateStatus(
        id: string,
        newStatus: DriverStatus,
        tx: Prisma.TransactionClient = prisma
    ) {
        const driver = await tx.driver.findUnique({ where: { id } });

        if (!driver) {
            throw new NotFoundError(`Driver with id ${id} not found.`);
        }

        // "Any → Suspended" logic is already inherently supported by ALLOWED_TRANSITIONS,
        // but we can explicitly allow it from ANY state to SUSPENDED.
        if (newStatus === DriverStatus.SUSPENDED) {
            // Allow unconditionally according to rules
        } else if (!this.canTransition(driver.status, newStatus)) {
            throw new StateTransitionError('Driver', driver.status, newStatus);
        }

        // Suspended blocks assignment is handled in TripService when assigning a trip
        return tx.driver.update({
            where: { id },
            data: { status: newStatus },
        });
    }

    /**
     * Suspend a driver unconditionally.
     */
    public static async suspendDriver(id: string) {
        return this.updateStatus(id, DriverStatus.SUSPENDED);
    }
}
