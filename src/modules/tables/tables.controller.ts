import {Router} from 'express';
import JWTPayload from '../../models/JWT.Payload.model';
import ErrorResponseHandler from '../../errors/error.response.handler';
import * as TablesService from './tables.service';

const router: Router = Router();
router.get('/', (async (req, res) => {
  try {
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const {restaurantId} = authUser;
    const tables = await TablesService
      .getAllTablesByRestaurantId(restaurantId);
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
    const createdTable = await TablesService.createTableInRestaurant(authUser.restaurantId, capacity, tableNumber);
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
    const deletedTable = await TablesService
      .deleteTableInRestaurant(authUser.restaurantId, +tableNumber);
    return res.status(200).send(deletedTable);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

export default router;
