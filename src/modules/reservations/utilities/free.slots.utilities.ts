import {Reservation} from '@prisma/client';
import {TimeSlot} from '../../../models/TimeSlot.model';
import {getEndOfTheDay, getStartOfTheDay} from './date.utilities';

export function getFreeSlots(
  allReservations: Reservation[],
  tableIds: number[],
  from: Date,
  to: Date
): TimeSlot[] {
  // reservations in tables should be sorted by 'from' date.
  const timeSlots = allReservations.map((r) => reservationToTimeSlot(r));
  const blockingIntersections = findBlockingIntersections(timeSlots, tableIds);
  return generateAvailableTimeSlots(blockingIntersections, tableIds.length, from, to);
}

function findBlockingIntersections(reservations: TimeSlot[], tableIds: number[]): TimeSlot[] {
  const tableCount = tableIds.length;
  const intersections = [] as TimeSlot[];
  if (reservations.length === 0) {
    return [];
  }

  intersections.push(reservations[0]);
  for (let i = 1; i < reservations.length; i++) {
    const current = reservations[i];
    const lastIntersection = intersections[intersections.length - 1] as TimeSlot;
    const maxStart = Math.max(lastIntersection.from.valueOf(), current.from.valueOf());
    const minEnd = Math.min(lastIntersection.to.valueOf(), current.to.valueOf());
    // if the intervals intersect, calculate the intersection
    if (maxStart < minEnd) {
      intersections[intersections.length - 1] = {
        from: new Date(maxStart),
        to: new Date(minEnd),
        tableIds: Array.from(new Set([...lastIntersection.tableIds, ...current.tableIds]))
      }
    } else {
      // if they don't intersect, add the current slot to be compared with the rest
      intersections.push(current);
    }
  }
  return intersections.filter((i) => i.tableIds.length === tableCount);
}

function reservationToTimeSlot({from, to, tableId}: Reservation): TimeSlot {
  return {
    from,
    to,
    tableIds: [tableId]
  };
}

function generateAvailableTimeSlots(blockingIntersection: TimeSlot[], tablesCount: number, from: Date, to: Date) {
  const slots: TimeSlot[] = [];
  const startOfDay = getStartOfTheDay(from);
  const startingTime = from > startOfDay ? from : startOfDay;
  let slot: TimeSlot = {from: startingTime};
  for (const intersection of blockingIntersection) {
    // if there is some time between intersections, we add an available slot
    if (intersection.from > slot.from) {
      slot.to = intersection.from;
      slots.push(slot);
    }
    slot = {from: intersection.to};
  }
  const endOfDay = getEndOfTheDay(from);
  slot.to = to < endOfDay ? to : endOfDay;
  slots.push(slot);
  return slots;
}
