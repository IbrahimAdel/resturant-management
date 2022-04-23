import { Router } from 'express';
import bcrypt from 'bcrypt';
import CreateUserDTO from '../users/DTOs/create.user.dto';
import JWTPayload from '../../models/JWT.Payload.model';
import { validateCreateTable, validateDeleteTable } from './validators/validator';
import ErrorResponseHandler from '../../errors/error.response.handler';
import CreateTableDto from './DTOs/create.table.dto';
import {createTable, deleteTable, getAllTablesForRestaurant} from '../../DAL/table.dal';

const router: Router = Router();
router.get('/', (async (req, res) => {
  try {
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const { restaurantId } = authUser;
    const tables = await getAllTablesForRestaurant(restaurantId)
    return res.status(200).send(tables);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.post('/', (async (req, res) => {
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

router.delete('/:tableNumber', (async (req, res) => {
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
