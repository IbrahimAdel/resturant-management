import { getRedisClient } from '../redis/RedisHandler';
import { getUserRoleFromDB } from '../DAL/user.dal';

const SIX_HOURS = 60 * 60 * 6;

export async function getUserRole(email: string) {
  const redis = getRedisClient();
  let role = await redis.get(email);
  if (!role) {
    role = await getUserRoleFromDB(email);
    await redis.set(email, role, {
      EX: SIX_HOURS
    });
  }
  return role;
}
