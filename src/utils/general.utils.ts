import {BaseError, ErrorInput} from "../errors/errros";
import {getEndOfTheDay} from "../controllers/reservations/utilities/date.utilities";

export function validateFromAndToDates(from: Date, to: Date) {
  if (!from.valueOf()) {
    const input: ErrorInput = {
      message: `invalid 'from' date`,
      code: 400,
      name: `Invalid Date Error`
    };
    throw new BaseError(input);
  }
  if (!to.valueOf()) {
    const input: ErrorInput = {
      message: `invalid 'to' date`,
      code: 400,
      name: `Invalid Date Error`
    };
    throw new BaseError(input);
  }

  if (from < new Date()) {
    const input: ErrorInput = {
      message: `'from' is in the past`,
      code: 400,
      name: `Invalid Date Error`
    };
    throw new BaseError(input);
  }

  if (to <= from) {
    const input: ErrorInput = {
      message: `'to' has to be after 'from'`,
      code: 400,
      name: `Invalid Date Error`
    };
    throw new BaseError(input);
  }

  if (to > getEndOfTheDay(from)) {
    const input: ErrorInput = {
      message: `'to' has to be in the same day as 'from'`,
      code: 400,
      name: `Invalid Date Error`
    };
    throw new BaseError(input);
  }
}