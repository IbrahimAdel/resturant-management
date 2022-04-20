import express from 'express';
import { getRedisClient } from './redis/RedisHandler';
import { getPrismaClient } from './orm/PrismaHandler';
import AuthController from './controllers/auth/auth.controller';
import AdminController from './controllers/admin/admin.controller';
import ReservationsController from './controllers/reservations/reservations.controller';
import { RoleMiddleware, JWTMiddleware } from "./middleware";

const app = express();

app.use(express.json());
const port = 8080;
app.get( "/", JWTMiddleware.verifyToken, RoleMiddleware.isAdmin, (req, res) => {
  return res.status(200).send({ message: 'thanks' });
});

app.use('/auth', AuthController);
app.use('/admin', JWTMiddleware.verifyToken, RoleMiddleware.isAdmin, AdminController);
app.use('/reservations', JWTMiddleware.verifyToken, ReservationsController);

app.listen( port, async () => {
  const redis = getRedisClient();
  redis.on('connect', () => {
    // tslint:disable-next-line:no-console
    console.log('Redis Connected!');
  });
  const prismaClient = getPrismaClient();
  await prismaClient.$connect().then(() => console.log('db connected'));
  await redis.connect();
  // tslint:disable-next-line:no-console
  console.log( `server started at http://localhost:${ port }` );
} );
