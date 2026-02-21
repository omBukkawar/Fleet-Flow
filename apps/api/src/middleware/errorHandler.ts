import { Request, Response, NextFunction } from 'express';
import { DomainError, ValidationError, NotFoundError, StateTransitionError } from '../errors/DomainError';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.statusCode,
        type: err.name
      }
    });
    return;
  }
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 401, type: 'AuthError' } });
    return;
  }
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ success: false, error: { message: 'Malformed JSON', code: 400, type: 'SyntaxError' } });
    return;
  }
  // Fallback
  res.status(500).json({ success: false, error: { message: err.message || 'Internal Server Error', code: 500, type: 'ServerError' } });
}
