import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authorization token missing');
  }

  const payload = verifyToken(token);
  req.user = { userId: payload.userId, role: payload.role };
  next();
}

export function requireRole(...roles: Array<'Admin' | 'Organizer' | 'Bidder' | 'Player'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission for this action');
    }

    next();
  };
}
