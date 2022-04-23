import {NextFunction, Request, Response} from 'express';
import {getUserRole} from '../caching/caching.service';
import JWTPayload from '../models/JWT.Payload.model';
import {BaseError} from "../errors/errros";
import ErrorResponseHandler from "../errors/error.response.handler";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AUTH_USER = res.locals.AUTH_USER as JWTPayload;
    const role = await getUserRole(AUTH_USER.email);
    if (!role || role !== 'Admin') {
      throw new BaseError({
        message: 'unauthorized',
        code: 403,
        name: 'Unauthorized Access'
      })
    }
    next();
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
};
