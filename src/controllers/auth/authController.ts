import { Router } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/secrets";
import { getPrismaClient } from "../../orm/PrismaHandler";
import bcrypt from 'bcrypt';
import {createRestaurantWithAdmin, getRestaurantWithAdmin} from "../../DAL/restaurant.dal";

const router: Router = Router();

router.post('/login', (async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const dbUser = await getPrismaClient().user
      .findUnique({
        where: {
          email
        }
      });
    if (dbUser) {
      const matchedPassword = await bcrypt.compare(password, dbUser.password);
      if (matchedPassword) {
        const user = { email };
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '4h' });
        return res.status(200).send({accessToken});
      }
      return res.status(403).send('Unauthorized');
    }
    return res.status(403).send('Unauthorized');
  } catch (e) {
    return res.status(500).send('error in the server');
  }
}));

router.post('/register', (async (req, res, next) => {
  try {
    const {
      username,
      password = '',
      restaurantName = ''
    } = req.body;
    if (password.trim().length < 6) {
      return res.status(500).send('password should be more than 6 characters')
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const { id } = await createRestaurantWithAdmin(restaurantName, username, hashedPassword);
    const dbUser = await getRestaurantWithAdmin(id);
    return res.status(200).send(dbUser);
  } catch (e) {
    return res.status(500).send('error in the server');
  }
}));

export default router;