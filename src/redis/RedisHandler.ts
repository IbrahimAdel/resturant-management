import { createClient, RedisClientType } from 'redis';

let redis: RedisClientType | undefined;

export const getRedisClient = () => {
  if (redis) {
    return redis;
  }
  redis = createClient({
    url: 'redis://ibrahim:secret@cache:6379'
  });
  return redis;
};
