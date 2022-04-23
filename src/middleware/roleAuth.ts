import {NextFunction, Request, Response} from 'express';
import {getUserRole} from '../caching/caching.service';
import JWTPayload from '../models/JWT.Payload.model';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const AUTH_USER = res.locals.AUTH_USER as JWTPayload;
  const role = await getUserRole(AUTH_USER.email);
  if (!role || role !== 'Admin') {
    return res.status(403).send('not admin');
  }
  next();
};
