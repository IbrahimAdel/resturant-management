import {Router} from "express";
import ErrorResponseHandler from "../../errors/error.response.handler";
import {getEndOfTheDay, getStartOfTheDay} from "./utilities/date.utilities";
import {getFreeSlotsForDateRange} from "../../DAL/reservation.dal";
import JWTPayload from "../../models/JWT.Payload.model";
import {addFreeSlotsToTables} from "./utilities/free.slots.utilities";

const router: Router = Router();

router.get('/', (async (req, res, next) => {
  try {
    const from = req.query.from as string;
    const to = req.query.to as string;
    const requiredSeats = req.query.requiredSeats as string;
    const formattedFromDate = new Date(from);
    const formattedToDate = new Date(to);
    const { offset, limit } = req.query;
    const authUser = req.body.AUTH_USER as JWTPayload;
    const result = await getFreeSlotsForDateRange(
      formattedFromDate, formattedToDate, +requiredSeats, authUser.restaurantId, +limit, +offset
    );
    result.rows = addFreeSlotsToTables(result.rows);
    return res.status(200).send(result);
  } catch (e) {
    return ErrorResponseHandler(res, e);
  }
}));


export default router;
