import express from 'express';
import { getRedisClient } from './redis/RedisHandler';
import { verifyToken } from "./middleware/jwtAuth";
import authController from './controllers/auth/authController';
import { isAdmin } from "./middleware/roleAuth";

const app = express();

app.use(express.json());
const port = 8080;
app.get( "/", verifyToken, isAdmin, (req, res) => {
  return res.status(200).send({ message: 'thanks' });
});

app.use('/auth', authController);

app.listen( port, async () => {
  const redis = getRedisClient();
  redis.on('connect', () => {
    // tslint:disable-next-line:no-console
    console.log('Redis Connected!');
  });
  await redis.connect();
  // tslint:disable-next-line:no-console
  console.log( `server started at http://localhost:${ port }` );
} );
