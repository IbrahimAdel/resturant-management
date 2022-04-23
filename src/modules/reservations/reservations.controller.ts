import {Router} from 'express';
import ErrorResponseHandler from '../../errors/error.response.handler';
import JWTPayload from '../../models/JWT.Payload.model';
import {isAdmin} from '../../middleware/roleAuth';
import * as ReservationService from "./reservations.service";

const router: Router = Router();

router.get('/available', (async (req, res) => {
  try {
    const requiredSeats = req.query.requiredSeats as string;
    const from = new Date(req.query.from as string);
    const to = new Date(req.query.to as string);
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const {restaurantId} = authUser;

    // minimumCapacity is null if there is no match from the requiredSeats
    const slots = await ReservationService
      .getAvailableReservationSlotsToday(restaurantId, requiredSeats, from, to)
    return res.status(200).send(slots);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.post('/', (async (req, res) => {
  try {
    const from = new Date(req.body.from as string);
    const to = new Date(req.body.to as string);
    const {tableNumber} = req.body;
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const {restaurantId} = authUser;
    const createdReservation = await ReservationService
      .createReservation(restaurantId, +tableNumber, from, to)
    return res.status(200).send(createdReservation);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.get('/today', (async (req, res) => {
  try {
    const {restaurantId} = res.locals.AUTH_USER as JWTPayload;
    const limit = +req.query.limit || 10;
    const offset = +req.query.offset || 0;
    let orderType = (req.query.order || 'asc') as 'asc' | 'desc';
    orderType = orderType.toLowerCase() as 'asc' | 'desc';
    const reservations = await ReservationService
      .getReservationsTodayPaginated(orderType, restaurantId, limit, offset);
    return res.status(200).send(reservations);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.get('/', isAdmin, (async (req, res) => {
  try {
    const {restaurantId} = res.locals.AUTH_USER as JWTPayload;
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
    const result = await ReservationService
      .getReservationsPaginatedForAdmin(orderType, restaurantId, limit, offset, from, to, tableNumbers);
    return res.status(200).send(result);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.delete('/:id', (async (req, res) => {
  try {
    const {restaurantId} = res.locals.AUTH_USER as JWTPayload;
    const id = +req.params.id;
    const deletedReservation = await ReservationService.deleteReservation(id, restaurantId)

    return res.status(200).send(deletedReservation);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

export default router;
