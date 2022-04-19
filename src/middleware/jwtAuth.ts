import {NextFunction, Request, Response} from 'express';
import {JWT_SECRET} from '../config/secrets';
import * as jwt from "jsonwebtoken";

async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader ? authHeader.split(' ') [1] : undefined;
  try {
    if (!accessToken) {
      throw new Error('unauthorized');
    }
    req.body.AUTH_USER = await jwt.verify(accessToken, JWT_SECRET) as any;

    next();
  } catch (e) {
    if (e.message === 'jwt expired') {
      return res.status(401).send('access token expired');
    }
    return res.status(403).send('unauthorized');
  }
}

export { verifyToken };
