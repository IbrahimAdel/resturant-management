import {createClient, RedisClientType} from 'redis';

let redis: RedisClientType | undefined;

export const getRedisClient = () => {
  if (redis) {
    return redis;
  }
  redis = createClient({
    url: 'redis://default:secret@cache:6379'
  });
  return redis;
};

export const closeRedisConnection = () => {
  if (redis) {
    return redis.disconnect();
  }
}
