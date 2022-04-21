import {Request, Response, NextFunction} from 'express';
import {getRedisClient} from "../redis/RedisHandler";
import {getUserRole} from "../DAL/user.dal";

const TWO_HOURS = 60 * 60 * 2;
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { AUTH_USER } = res.locals;
  const redis = getRedisClient();
  let role = await redis.get(AUTH_USER.email);
  if (!role) {
    role = await getUserRole(AUTH_USER.email);
    await redis.set(AUTH_USER.username, role, {
      EX: TWO_HOURS
    });
  }
  if (!role || role !== 'Admin') {
    return res.status(403).send('not admin');
  }
  next();
};
