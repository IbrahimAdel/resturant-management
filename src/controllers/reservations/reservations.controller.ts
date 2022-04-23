import { Router } from 'express';
import ErrorResponseHandler from '../../errors/error.response.handler';
import { getMinimumCapacity, getTablesWithExactCapacityIncludingReservations } from '../../DAL/table.dal';
import JWTPayload from '../../models/JWT.Payload.model';
import { getFreeSlots } from './utilities/free.slots.utilities';
import {
  validateCreateReservation, validateDeleteReservation, validateGetAllReservations,
  validateGetAvailableReservationSlots,
  validateGetTodayReservations
} from './validators/reservations.validator';
import {
  createReservationByTableNumber, deleteReservationById,
  getAllReservationsInDayPaginated, getReservationsPaginated
} from '../../DAL/reservation.dal';
import { isAdmin } from '../../middleware/roleAuth';

const router: Router = Router();

router.get('/available', (async (req, res) => {
  try {
    const requiredSeats = req.query.requiredSeats as string;
    const from = new Date(req.query.from as string);
    const to = new Date(req.query.to as string);
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const { restaurantId } = authUser;

    // minimumCapacity is null if there is no match from the requiredSeats
    const minimumCapacity = await getMinimumCapacity(restaurantId, +requiredSeats);
    validateGetAvailableReservationSlots(from, to, +requiredSeats, minimumCapacity);
    const tables = await getTablesWithExactCapacityIncludingReservations(restaurantId, minimumCapacity, from, to);
    const slots = getFreeSlots(tables, from, to);
    return res.status(200).send(slots);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.post('/', (async (req, res) => {
  try {
    const from = new Date(req.body.from as string);
    const to = new Date(req.body.to as string);
    const { tableNumber } = req.body;
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const { restaurantId } = authUser;

    // minimumCapacity is null if there is no match from the requiredSeats
    await validateCreateReservation(from, to, tableNumber, restaurantId);
    const createdReservation = await createReservationByTableNumber(tableNumber, restaurantId, from, to);
    return res.status(200).send(createdReservation);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.get('/today', (async (req, res) => {
  try {
    const today = new Date();
    const { restaurantId } = res.locals.AUTH_USER as JWTPayload;
    const limit = +req.query.limit || 10;
    const offset = +req.query.offset || 0;
    let orderType = (req.query.order || 'asc') as 'asc' | 'desc';
    orderType = orderType.toLowerCase() as 'asc' | 'desc';
    validateGetTodayReservations(orderType, limit);
    const result = await getAllReservationsInDayPaginated(today, restaurantId, offset, limit, orderType);
    return res.status(200).send(result);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.get('/', isAdmin, (async (req, res) => {
  try {
    const { restaurantId } = res.locals.AUTH_USER as JWTPayload;
    const limit = +req.query.limit || 10;
    const offset = +req.query.offset || 0;
    const from = new Date(req.query.from as string);
    const to = new Date(req.query.to as string);
    const tableNumbers = req.query.tableNumbers ?
      (req.query.tableNumbers as string)
        .split(',')
        .map((n) => +n)
      : undefined;
    let orderType = (req.query.order || 'asc') as 'asc' | 'desc';
    orderType = orderType.toLowerCase() as 'asc' | 'desc';
    validateGetAllReservations(orderType, limit, tableNumbers);
    const result = await getReservationsPaginated(restaurantId, tableNumbers, from, to, orderType, offset, limit);
    return res.status(200).send(result);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.delete('/:id', (async (req, res) => {
  try {
    const { restaurantId } = res.locals.AUTH_USER as JWTPayload;
    const id = +req.params.id;
    await validateDeleteReservation(id, restaurantId);

    const deletedReservation = await deleteReservationById(id);

    return res.status(200).send(deletedReservation);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

export default router;
