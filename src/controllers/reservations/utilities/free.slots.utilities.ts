import {getEndOfTheDay, getStartOfTheDay} from "./date.utilities";

export function addFreeSlotsToTables(tables: any[]) {
  tables.forEach((table) => {
    const slots: { from: Date, to: Date } [] = [];
    const from = new Date(Math.max(getStartOfTheDay().valueOf(), Date.now()));
    const currentSlot = { from } as { from: Date, to: Date };
    table.reservations.forEach((reservation: any) => {
      currentSlot.to = reservation.from;
      slots.push(currentSlot);
      currentSlot.from = reservation.to;
    });
    currentSlot.to = getEndOfTheDay();
    slots.push(currentSlot);
    delete table.reservations;
    table.freeSlots = slots;
  });
  return tables;
}