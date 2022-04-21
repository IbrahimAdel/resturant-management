import {Router} from "express";
import ErrorResponseHandler from "../../errors/error.response.handler";
import {getMinimumCapacity} from "../../DAL/table.dal";
import JWTPayload from "../../models/JWT.Payload.model";
import {getTablesWithExactCapacityIncludingReservations} from "../../DAL/table.dal";
import {getFreeSlots} from "./utilities/free.slots.utilities";
import {validateCreateReservation, validateGetAvailableReservationSlots} from "./validators/reservations.validator";
import {createReservationByTableNumber} from "../../DAL/reservation.dal";

const router: Router = Router();

router.get('/available', (async (req, res, next) => {
  try {
    const requiredSeats = req.query.requiredSeats as string;
    const from = new Date(req.query.from as string);
    const to = new Date(req.query.to as string);
    const authUser = res.locals.AUTH_USER as JWTPayload;
    const { restaurantId } = authUser;

    // minimumCapacity is null if there is no match from the requiredSeats
    const minimumCapacity = await getMinimumCapacity(restaurantId, +requiredSeats);
    validateGetAvailableReservationSlots(from, to, +requiredSeats, minimumCapacity);
    const tables = await getTablesWithExactCapacityIncludingReservations(
      restaurantId, minimumCapacity, from, to
    );
    const slots = getFreeSlots(tables, from, to);
    return res.status(200).send(slots);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));

router.post('/', (async (req, res, next) => {
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

router.get('/', (async (req, res, next) => {
  try {
    const today = new Date();
    const authUser = res.locals.AUTH_USER as JWTPayload;
    return res.status(200).send();
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));



export default router;
