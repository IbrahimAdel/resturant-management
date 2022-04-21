import { BaseError, ErrorInput } from "../../../errors/errros";
import {validateFromAndToDates, validateLimitPagination} from "../../../utils/general.validator";
import { countReservationsInTimeSlot } from "../../../DAL/reservation.dal";

export function validateGetAvailableReservationSlots(
  from: Date, to: Date, requiredSeats: number, minimumCapacity: number
) {
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
