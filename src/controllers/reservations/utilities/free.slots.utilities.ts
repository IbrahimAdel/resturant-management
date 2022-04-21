import {TimeSlot} from "../../../models/TimeSlot.model";
import {Reservation, Prisma} from "@prisma/client";

const tableWithReservations = Prisma.validator<Prisma.TableArgs>()({
  include: {reservations: true},
});
type TableWithReservations = Prisma.TableGetPayload<typeof tableWithReservations>;

export function getFreeSlots(
  tables: TableWithReservations[],
  from: Date,
  to: Date
): TimeSlot[] {
  const intersections = findAllIntersections(tables, from, to);
  // reservations in tables should be sorted by 'from' date.
  return generateAvailableTimeSlots(intersections, tables.length, from, to);
}

function findAllIntersections(tables: TableWithReservations[], from: Date, to: Date) {
  if (tables.length === 1) {
    const allIntersections: TimeSlot[] = tables[0].reservations
      .map((r) => ({from: r.from, to: r.to, tables}));
    return generateAvailableTimeSlots(allIntersections, tables.length, from, to);
  }
  let intersections: TimeSlot[] = [];
  for (let i = 1; i < tables.length; i++) {
    const currentTable = tables[i];
    const previousTable = tables[i - 1];
    intersections = [...intersections, ...intervalIntersection(currentTable.reservations, previousTable.reservations)];
  }
  return intersections;
}

function intervalIntersection(a: Reservation[], b: Reservation[]): TimeSlot[] {
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
        tables: [{id: a[aPointer].tableId}, {id: b[bPointer].tableId}]
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

function generateAvailableTimeSlots(aggregateIntersections: TimeSlot[], tablesCount: number, from: Date, to: Date) {
  const slots: TimeSlot[] = [];
  let slot: TimeSlot = { from };
  for (const intersection of aggregateIntersections) {
    if (intersection.tables.length === tablesCount) {
      // if there is some time between intersections, we add an available slot
      if (intersection.from > slot.from) {
        slot.to = intersection.from;
        slots.push(slot);
      }
      slot = { from: intersection.to };
    }
  }
  slot.to = to;
  slots.push(slot);
  return slots;
}