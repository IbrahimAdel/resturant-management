import {Router} from "express";
import ErrorResponseHandler from "../../errors/error.response.handler";
import {getMinimumCapacity} from "../../DAL/table.dal";
import JWTPayload from "../../models/JWT.Payload.model";
import {getTablesWithExactCapacityIncludingReservations} from "../../DAL/table.dal";
import {getFreeSlots} from "./utilities/free.slots.utilities";
import {validateGetAvailableReservationSlots} from "./validators/reservations.validator";

const router: Router = Router();

router.get('/available', (async (req, res, next) => {
  try {
    const requiredSeats = req.query.requiredSeats as string;
    const from = new Date(req.query.from as string);
    const to = new Date(req.query.to as string);
    const authUser = req.body.AUTH_USER as JWTPayload;
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


export default router;
