import { BaseError, ErrorInput } from '../errors/errros';
import { getEndOfTheDay } from '../controllers/reservations/utilities/date.utilities';

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

// pagination limit guard for high values
export function validateLimitPagination(limit: number) {
  const maxLimit = 200;
  if (limit > maxLimit) {
    const input: ErrorInput = {
      message: `'limit' should be lower than ${maxLimit}`,
      code: 400,
      name: `Query Parameters Error`
    };
    throw new BaseError(input);
  }
}

export function validateEmail(email: string) {
  const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/;
  return regex.test(email);
}
