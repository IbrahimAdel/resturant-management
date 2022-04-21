import {Router} from "express";
import ErrorResponseHandler from "../../errors/error.response.handler";
import {getMinimumCapacity} from "../../DAL/table.dal";
import JWTPayload from "../../models/JWT.Payload.model";
import {getTablesWithExactCapacityIncludingReservations} from "../../DAL/table.dal";
import {getFreeSlots} from "./utilities/free.slots.utilities";

const router: Router = Router();

router.get('/available', (async (req, res, next) => {
  try {
    let from = req.query.from as any;
    let to = req.query.to as any;
    const requiredSeats = req.query.requiredSeats as string;
    from = new Date(from);
    to = new Date(to);
    const authUser = req.body.AUTH_USER as JWTPayload;
    const { restaurantId } = authUser;

    // null if there is no match from the requiredSeats
    const minimumCapacity = await getMinimumCapacity(restaurantId, +requiredSeats);
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
