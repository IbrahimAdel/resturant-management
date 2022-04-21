import { BaseError, ErrorInput } from "../../../errors/errros";
import {getEndOfTheDay, getStartOfTheDay} from "../utilities/date.utilities";

export function validateGetAvailableReservationSlots(
  from: Date, to: Date, requiredSeats: number, minimumCapacity: number
) {
  if (!from.valueOf()) {
    const input: ErrorInput = {
      message: `invalid 'from' date`,
      code: 400,
      name: 'Query Parameter Error'
    };
    throw new BaseError(input);
  }
  if (!to.valueOf()) {
    const input: ErrorInput = {
      message: `invalid 'to' date`,
      code: 400,
      name: 'Query Parameter Error'
    };
    throw new BaseError(input);
  }

  if (from < new Date()) {
    const input: ErrorInput = {
      message: `'from' is in the past`,
      code: 400,
      name: 'Query Parameter Error'
    };
    throw new BaseError(input);
  }

  if (to <= from) {
    const input: ErrorInput = {
      message: `'to' has to be after 'from'`,
      code: 400,
      name: 'Query Parameter Error'
    };
    throw new BaseError(input);
  }

  if (to > getEndOfTheDay(from)) {
    const input: ErrorInput = {
      message: `'to' has to be in the same day as 'from'`,
      code: 400,
      name: 'Query Parameter Error'
    };
    throw new BaseError(input);
  }

  if (!minimumCapacity) {
    const input: ErrorInput = {
      message: `no table available to serve ${requiredSeats}`,
      code: 400,
      name: 'Capacity Error'
    };
    throw new BaseError(input);
  }
}