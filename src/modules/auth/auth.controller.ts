import {Router} from 'express';
import ErrorResponseHandler from "../../errors/error.response.handler";
import {registerNewRestaurantWithAdmin, verifyLogin} from "./auth.service";

const router: Router = Router();


router.post('/login', (async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    const password = req.body.password as string;
    const accessToken = await verifyLogin(email, password);
    res.status(200).send({accessToken})
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
    const dbUser = await registerNewRestaurantWithAdmin(email, password, name, restaurantName);
    return res.status(200).send(dbUser);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

export default router;
