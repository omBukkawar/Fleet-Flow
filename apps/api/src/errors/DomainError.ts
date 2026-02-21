export class DomainError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

export class ValidationError extends DomainError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class NotFoundError extends DomainError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class StateTransitionError extends DomainError {
    constructor(entity: string, current: string, target: string) {
        super(`Invalid state transition for ${entity} from ${current} to ${target}`, 409);
    }
}
