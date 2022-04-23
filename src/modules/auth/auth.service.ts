import {getPrismaClient} from "../../orm/PrismaHandler";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {BaseError} from "../../errors/errros";
import {validateRegister} from "./validators/auth.validator";
import {createRestaurantWithAdmin, getRestaurantWithAdmin} from "../../DAL/restaurant.dal";

export async function verifyLogin(email: string, password: string) {
  const dbUser = await getPrismaClient().user
    .findUnique({
      where: {
        email
      }
    });
  if (dbUser) {
    const JWT_SECRET = process.env.JWT_SECRET;
    const matchedPassword = await bcrypt.compare(password, dbUser.password);
    if (matchedPassword) {
      const user = {email, restaurantId: dbUser.restaurantId};
      return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' })
    }
    console.log(`email:${email} wrong password`)
    throwUnauthorizedError();
  }
  console.log(`email: ${email} not found`)
  throwUnauthorizedError();
}

export async function registerNewRestaurantWithAdmin(email: string, password: string, name: string, restaurantName: string) {
  await validateRegister(password, email);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const {id} = await createRestaurantWithAdmin(restaurantName, name, email, hashedPassword);
  return await getRestaurantWithAdmin(id);
}

function throwUnauthorizedError() {
  throw new BaseError({
    code: 403,
    message: 'unauthorized',
    name: 'Unauthorized Error'
  })
}