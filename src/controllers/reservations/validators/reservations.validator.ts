import { BaseError, ErrorInput } from '../../../errors/errros';
import { validateFromAndToDates, validateLimitPagination } from '../../../utils/general.validator';
import { countReservationsInTimeSlot, getReservationByIdAndRestaurantId } from '../../../DAL/reservation.dal';
import { getEndOfTheDay } from '../utilities/date.utilities';

export function validateGetAvailableReservationSlots(from: Date, to: Date, requiredSeats: number, minimumCapacity: number) {
  validateFromAndToDates(from, to);
  if (!minimumCapacity) {
    const input: ErrorInput = {
      message: `no table available to serve ${requiredSeats}`,
      code: 400,
      name: 'Capacity Error'
    };
    throw new BaseError(input);
  }
}

export async function validateCreateReservation(from: Date, to: Date, tableNumber: number, restaurantId: number) {
  validateFromAndToDates(from, to);
  const reservationsCount = await countReservationsInTimeSlot(tableNumber, restaurantId, from, to);
  if (reservationsCount > 0) {
    const input: ErrorInput = {
      message: `table '${tableNumber}' has reservations in the specified time period`,
      code: 400,
      name: 'Reservation Error'
    };
    throw new BaseError(input);
  }
}

export function validateGetTodayReservations(orderType: string, limit: number) {
  validateLimitPagination(limit);
  if (orderType.toLowerCase() !== 'asc' && orderType.toLowerCase() !== 'desc') {
    const input: ErrorInput = {
      message: `'order' should be either 'asc' or 'desc'`,
      code: 400,
      name: `Query Parameters Error`
    };
    throw new BaseError(input);
  }
}

export function validateGetAllReservations(orderType: string, limit: number, tableNumbers: number[]) {
  validateLimitPagination(limit);
  if (orderType.toLowerCase() !== 'asc' && orderType.toLowerCase() !== 'desc') {
    const input: ErrorInput = {
      message: `'order' should be either 'asc' or 'desc'`,
      code: 400,
      name: `Query Parameters Error`
    };
    throw new BaseError(input);
  }

  if (tableNumbers && tableNumbers.includes(Number.NaN)) {
    const input: ErrorInput = {
      message: `invalid 'tableNumbers' value`,
      code: 400,
      name: `Query Parameters Error`
    };
    throw new BaseError(input);
  }
}

export async function validateDeleteReservation(id: number, restaurantId: number) {
  if (!id) {
    const input: ErrorInput = {
      message: `invalid path parameter`,
      code: 400,
      name: `Path Parameter Error`
    };
    throw new BaseError(input);
  }
  const reservation = await getReservationByIdAndRestaurantId(id, restaurantId);
  if (!reservation) {
    const input: ErrorInput = {
      message: `reservation not found`,
      code: 404,
      name: `Resource Not Found Error`
    };
    throw new BaseError(input);
  }

  const now = new Date();
  // will allow deletion of current reservations.
  if (reservation.to <= now) {
    const input: ErrorInput = {
      message: `can not delete reservations in the past`,
      code: 400,
      name: `Invalid Delete Request Error`
    };
    throw new BaseError(input);
  }

  // if reservation is not in the current working day
  if (reservation.from > getEndOfTheDay(now)) {
    const input: ErrorInput = {
      message: `can not delete reservations in coming days`,
      code: 400,
      name: `Invalid Delete Request Error`
    };
    throw new BaseError(input);
  }
}
