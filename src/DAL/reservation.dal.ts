import {getPrismaClient} from "../orm/PrismaHandler";
import {TimeSlot} from "../models/TimeSlot.model";
import {getEndOfTheDay, getStartOfTheDay} from "../controllers/reservations/utilities/date.utilities";

export const getFutureReservationCountForTable = (tableId: number) => {
  const client = getPrismaClient();
  return client.reservation.count({
    where: {
      tableId,
      OR: [
        {
          from: {
            gt: new Date()
          }
        },
        {
          to: {
            gt: new Date()
          }
        }
      ]
    }
  });
};

export const countReservationsInTimeSlot = async (tableNumber: number, restaurantId: number, from: Date, to: Date) => {
  const client = getPrismaClient();
  return client.reservation.count({
    where: {
      OR: [
        {
          from: {
            gt: from,
            lt: to
          }
        },
        {
          to: {
            lt: to,
            gt: from
          }
        },
        {
          from: {
            lte: from
          },
          to: {
            gte: to
          }
        }
      ],
      from: {
        gte: getStartOfTheDay(from)
      },
      to: {
        lte: getEndOfTheDay(from)
      },
      table: {
        restaurantId,
        number: tableNumber
      }
    }
  });
};

export const createReservationByTableNumber = (tableNumber: number, restaurantId: number, from: Date, to: Date) => {
  const client = getPrismaClient();
  return client.reservation.create({
    data: {
      from,
      to,
      table: {
        connect: {
          restaurantId_number: {
            restaurantId,
            number: tableNumber
          }
        }
      }
    }
  });
};
