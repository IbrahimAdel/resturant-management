import { Prisma, Reservation } from '@prisma/client';
import { TimeSlot } from '../../../models/TimeSlot.model';
import { getEndOfTheDay, getStartOfTheDay } from './date.utilities';

const tableWithReservations = Prisma.validator<Prisma.TableArgs>()({
  include: { reservations: true },
});
type TableWithReservations = Prisma.TableGetPayload<typeof tableWithReservations>;

export function getFreeSlots(
  tables: TableWithReservations[],
  from: Date,
  to: Date
): TimeSlot[] {
  // reservations in tables should be sorted by 'from' date.
  const intersections = findAllIntersections(tables, from, to);
  return generateAvailableTimeSlots(intersections, tables.length, from, to);
}

function findAllIntersections(tables: TableWithReservations[], from: Date, to: Date) {
  if (tables.length === 1) {
    const allIntersections: TimeSlot[] = tables[0].reservations
      .map((r) => ({ from: r.from, to: r.to, tables }));
    return generateAvailableTimeSlots(allIntersections, tables.length, from, to);
  }
  const intersections: TimeSlot[] = [];
  for (let i = 0; i < tables.length; i++) {
    const currentTable = tables[i];
    for (let j = i + 1; j < tables.length; j++) {
      const nextTable = tables[j];
      intersections.push(...reservationIntersection(currentTable.reservations, nextTable.reservations));
    }
  }
  if (intersections.length === 1) {
    return intersections;
  }
  const aggregatedIntersections: TimeSlot[] = [];

  for (let i = 0; i < intersections.length; i++) {
    const currentIntersection = intersections[i];
    for (let j = i + 1; j < intersections.length; j++) {
      const nextIntersection = intersections[j];
      const result = timeSlotsIntersection(currentIntersection, nextIntersection);
      if (result) {
        const found = aggregatedIntersections.find((inter) => inter.from.valueOf() === result.from.valueOf()
          && inter.to.valueOf() === result.to.valueOf() && compareArrays(inter.tableIds, result.tableIds));
        if (!found) {
          aggregatedIntersections.push(result);
        }
      }
    }
  }
  return aggregatedIntersections;
}

function reservationIntersection(a: Reservation[], b: Reservation[]): TimeSlot[] {
  let aPointer = 0;
  let bPointer = 0;
  const result: TimeSlot[] = [];

  while (aPointer < a.length && bPointer < b.length) {
    // largest starting point of the interval
    const maxStart = Math.max(a[aPointer].from.valueOf(), b[bPointer].from.valueOf());

    // smallest end point of the interval
    const minEnd = Math.min(a[aPointer].to.valueOf(), b[bPointer].to.valueOf());

    // if the intervals intersect
    if (maxStart < minEnd) {
      result.push({
        from: new Date(maxStart),
        to: new Date(minEnd),
        tableIds: [a[aPointer].tableId, b[bPointer].tableId]
      });
    }

    // move a pointer depending on which end point of the interval is smaller
    if (a[aPointer].to < b[bPointer].to) {
      aPointer++;
    } else {
      bPointer++;
    }
  }

  return result;
}

function timeSlotsIntersection(a: TimeSlot, b: TimeSlot): TimeSlot | undefined {
  const maxStart = Math.max(a.from.valueOf(), b.from.valueOf());

  // smallest end point of the interval
  const minEnd = Math.min(a.to.valueOf(), b.to.valueOf());
  if (maxStart < minEnd) {
    return {
      from: new Date(maxStart),
      to: new Date(minEnd),
      tableIds: Array.from(new Set([...a.tableIds, ...b.tableIds]))
    };
  }
  return undefined;
}

function generateAvailableTimeSlots(aggregateIntersections: TimeSlot[], tablesCount: number, from: Date, to: Date) {
  const slots: TimeSlot[] = [];
  const startOfDay = getStartOfTheDay(from);
  const startingTime = from > startOfDay ? from : startOfDay;
  let slot: TimeSlot = { from: startingTime };
  for (const intersection of aggregateIntersections) {
    if (intersection.tableIds.length === tablesCount) {
      // if there is some time between intersections, we add an available slot
      if (intersection.from > slot.from) {
        slot.to = intersection.from;
        slots.push(slot);
      }
      slot = { from: intersection.to };
    }
  }
  const endOfDay = getEndOfTheDay(from);
  slot.to = to < endOfDay ? to : endOfDay;
  slots.push(slot);
  return slots;
}

function compareArrays(a: any[], b: any[]) {
  return a.length === b.length && a.every((a1) => b.includes(a1));
}
