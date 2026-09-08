import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { authConfig } from '@/configs/auth';
import { AppError } from '@/utils/AppError';

interface TokenPayload {
  role: string;
  sub: string;
}

function ensureAuthenticated(request: Request, response: Response, next: NextFunction): void {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new AppError('JWT token not found', 401);
        }

        // [Bearer, token]
        const [, token] = authHeader.split(' ');

        const { role, sub: user_id} = jwt.verify(token, authConfig.jwt.secret) as TokenPayload;

        request.user = {
            id: user_id,
            role,
        };

        return next();

    } catch (error) {
        throw new AppError('Invalid JWT token', 401);
    }
}

export { ensureAuthenticated };
