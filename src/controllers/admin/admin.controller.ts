import { Router } from "express";
import bcrypt from "bcrypt";
import CreateUserDTO from "./DTOs/create.user.dto";
import JWTPayload from "../../models/JWT.Payload.model";
import {createNonAdminUser} from "../../DAL/user.dal";
import {validateCreateTable, validateCreateUser, validateDeleteTable} from "./validators/validator";
import ErrorResponseHandler from "../../errors/error.response.handler";
import CreateTableDto from "./DTOs/create.table.dto";
import {createTable, deleteTable} from "../../DAL/table.dal";

const router: Router = Router();

router.post('/users', (async (req, res, next) => {
  try {
    const {
      email = '',
      password = '',
      name = '',
      number: userNumber = ''
    } = req.body;
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const userDTO: CreateUserDTO = {
      name,
      email,
      password,
      restaurantId: authUser.restaurantId,
      number: userNumber
    };
    await validateCreateUser(userDTO);
    const salt = await bcrypt.genSalt(10);
    userDTO.password = await bcrypt.hash(password, salt);
    const createdUser = await createNonAdminUser(userDTO);
    delete createdUser.password;
    return res.status(200).send(createdUser);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.post('/tables', (async (req, res, next) => {
  try {
    const {
      number: tableNumber = 0,
      capacity = 0,
    } = req.body;
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const tableDto: CreateTableDto = {
      number: tableNumber,
      capacity,
      restaurantId: authUser.restaurantId
    };
    await validateCreateTable(tableDto);
    const createdTable = await createTable(tableDto);
    return res.status(200).send(createdTable);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.delete('/tables/:tableNumber', (async (req, res, next) => {
  try {
    const {
      tableNumber
    } = req.params;
    const authUser = res.locals.AUTH_USER as JWTPayload;
    await validateDeleteTable(+tableNumber, authUser.restaurantId);
    const deletedTable = await deleteTable(+tableNumber, authUser.restaurantId);
    return res.status(200).send(deletedTable);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));



export default router;
