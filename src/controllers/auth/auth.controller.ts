import {Router} from 'express';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {getPrismaClient} from '../../orm/PrismaHandler';
import {createRestaurantWithAdmin, getRestaurantWithAdmin} from '../../DAL/restaurant.dal';
import {validateRegister} from "./validators/auth.validator";
import ErrorResponseHandler from "../../errors/error.response.handler";

const router: Router = Router();


router.post('/login', (async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    const password = req.body.password as string;
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
        const accessToken = jwt.sign(user, JWT_SECRET, {expiresIn: '4h'});
        return res.status(200).send({accessToken});
      }
      console.log(`email:${email} wrong password`)
      return res.status(403).send('Unauthorized');
    }
    console.log(`email: ${email} not found`)
    return res.status(403).send('Unauthorized');
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.post('/register', (async (req, res) => {
  try {
    const {
      password = '',
      name = '',
      restaurantName = ''
    } = req.body;
    const email = (req.body.email || '').toLowerCase();
    await validateRegister(password, email);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const {id} = await createRestaurantWithAdmin(restaurantName, name, email, hashedPassword);
    const dbUser = await getRestaurantWithAdmin(id);
    return res.status(200).send(dbUser);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

export default router;
