import {Router} from "express";
import JWTPayload from "../../models/JWT.Payload.model";
import CreateUserDTO from "./DTOs/create.user.dto";
import {validateCreateUser} from "../tables/validators/validator";
import bcrypt from "bcrypt";
import {createNonAdminUser, getAllUsers} from "../../DAL/user.dal";
import ErrorResponseHandler from "../../errors/error.response.handler";
import * as UsersService from "./users.service";

const router: Router = Router();

router.get('/', (async (req, res) => {
  try {
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const users = await UsersService.getAllUsersInRestaurant(authUser.restaurantId);
    return res.status(200).send(users);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.post('/', (async (req, res) => {
  try {
    const {
      email = '',
      password = '',
      name = '',
      number: userNumber = ''
    } = req.body;
    const { restaurantId } = res.locals.AUTH_USER as JWTPayload;
    const createdUser = await UsersService
      .addUserInRestaurant(restaurantId, email, name, password, userNumber);
    return res.status(200).send(createdUser);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));
export default router;
