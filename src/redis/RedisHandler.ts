import {createClient, RedisClientType} from "redis";

let redis: RedisClientType | undefined;

export const getRedisClient = () => {
  if (redis) {
    return redis;
  }
  redis = createClient();
  return redis;
};
