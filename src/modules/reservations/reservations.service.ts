import {getMinimumCapacity, getTablesIdsWithExactCapacity} from "../../DAL/table.dal";
import {
  validateCreateReservation, validateDeleteReservation, validateGetAllReservations,
  validateGetAvailableReservationSlots,
  validateGetTodayReservations
} from "./validators/reservations.validator";
import {TimeSlot} from "../../models/TimeSlot.model";
import {
  createReservationByTableNumber, deleteReservationById, getAllReservationsInDayPaginated,
  getAllReservationsInTableWithCapacitySortedByFrom,
  getReservationsPaginated
} from "../../DAL/reservation.dal";
import {getFreeSlots} from "./utilities/free.slots.utilities";
import {getEndOfTheDay, getStartOfTheDay} from "./utilities/date.utilities";

export async function getAvailableReservationSlotsToday(restaurantId: number, requiredSeats: number | string, from: Date, to: Date) {
  const minimumCapacity = await getMinimumCapacity(restaurantId, +requiredSeats);
  validateGetAvailableReservationSlots(from, to, +requiredSeats, minimumCapacity);
  const tableIds = await getTablesIdsWithExactCapacity(restaurantId, minimumCapacity);
  const timeSlot: TimeSlot = {from, to, tableIds: []};
  const allReservations = await getAllReservationsInTableWithCapacitySortedByFrom(tableIds, timeSlot);
  return getFreeSlots(allReservations, tableIds, from, to);
}

export async function createReservation(restaurantId: number, tableNumber: number, from: Date, to: Date) {
  // minimumCapacity is null if there is no match from the requiredSeats
  await validateCreateReservation(from, to, tableNumber, restaurantId);
  return createReservationByTableNumber(tableNumber, restaurantId, from, to);
}

export async function getReservationsTodayPaginated(orderType: 'asc' | 'desc', restaurantId: number, limit: number, offset: number) {
  const today = new Date();
  validateGetTodayReservations(orderType, limit);
  return getAllReservationsInDayPaginated(today, restaurantId, offset, limit, orderType);
}

export async function getReservationsPaginatedForAdmin(
  orderType: 'asc' | 'desc', restaurantId: number, limit: number, offset: number, from: Date, to: Date, tableNumbers: number[]
) {
  // if no dates are provided, use start of the day and end of the day
  let adjustedFrom = from;
  let adjustedTo = to;
  if (!adjustedFrom.valueOf()) adjustedFrom = getStartOfTheDay();
  if (!adjustedTo.valueOf()) adjustedTo = getEndOfTheDay();
  validateGetAllReservations(orderType, limit, tableNumbers);
  return getReservationsPaginated(restaurantId, tableNumbers, adjustedFrom, adjustedTo, orderType, offset, limit);
}

export async function deleteReservation(reservationId: number, restaurantId: number) {
  await validateDeleteReservation(reservationId, restaurantId);

  return deleteReservationById(reservationId);
}