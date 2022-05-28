import * as dotenv from 'dotenv'
import express from 'express';
import {closeRedisConnection, getRedisClient} from './redis/RedisHandler';
import {closePrismaConnection, getPrismaClient} from './orm/PrismaHandler';
import AuthController from './modules/auth/auth.controller';
import TablesController from './modules/tables/tables.controller';
import ReservationsController from './modules/reservations/reservations.controller';
import UsersController from "./modules/users/users.controller";
import {JWTMiddleware, RoleMiddleware} from './middleware';

const app = express();

app.use(express.json());
const port = 8080;

app.use('/auth', AuthController);
app.use('/tables', JWTMiddleware.verifyToken, RoleMiddleware.isAdmin, TablesController);
app.use('/reservations', JWTMiddleware.verifyToken, ReservationsController);
app.use('/users', JWTMiddleware.verifyToken, UsersController);
dotenv.config() // Load the environment variables

const server = app.listen(port, async () => {
  const redis = getRedisClient();
  redis.on('connect', () => {
    // tslint:disable-next-line:no-console
    console.log('Redis Connected!');
  });
  let retries = 5;
  while (retries > 0) {
    try {
      const prismaClient = getPrismaClient();
      await prismaClient.$connect().then(() => {
        console.log('db connected');
      });
      await redis.connect();
      break;
    } catch (e) {
      console.log('logging error:');
      console.log(e)
      await new Promise((resolve) => {
        retries -= 1;
        setTimeout(resolve, 5000);
      });
    }
  }
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});

server.on('close', async () => {
  await closePrismaConnection();
  await closeRedisConnection();
})

export default server;
