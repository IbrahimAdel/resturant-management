import {getPrismaClient} from "../orm/PrismaHandler";
import {TimeSlot} from "../models/TimeSlot.model";
import {getEndOfTheDay, getStartOfTheDay} from "../controllers/reservations/utilities/date.utilities";
import exp from "constants";
import {Page} from "../models/Page.model";

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

export const getAllReservationsInDayPaginated = async (
  date: Date, restaurantId: number, offset = 0, limit = 10, orderType: 'asc' | 'desc'
): Promise<Page> => {
  const client = getPrismaClient();
  const args = {
    where: {
      from: {
        gte: getStartOfTheDay(date)
      },
      to: {
        lte: getEndOfTheDay(date)
      },
      table: {
        restaurantId
      }
    }
  };
  const total = await client.reservation.count(args);
  const rows = await client.reservation.findMany({
    ...args,
    take: limit,
    skip: offset,
    orderBy: [{
      from: orderType
    }]
  });
  return { rows, total } as Page;
};

export const getReservationsPaginated = async (
  restaurantId: number, tableNumbers: number[] | undefined,
  from: Date, to: Date, orderType: 'asc' | 'desc',
  offset: number, limit: number
): Promise<Page> => {
  const client = getPrismaClient();
  const args = {
    where: {
      from: {
        gte: from
      },
      to: {
        lte: to
      },
      table: {
        restaurantId,
        number: tableNumbers ? {
          in: tableNumbers
        } : undefined
      }
    }
  };
  const total = await client.reservation.count(args);
  const rows = await client.reservation.findMany({
    ...args,
    take: limit,
    skip: offset,
    orderBy: [{
      from: orderType
    }]
  });
  return { rows, total } as Page;
};

// restaurantId for extra security between accounts
export const getReservationByIdAndRestaurantId = (id: number, restaurantId: number) => {
  const client = getPrismaClient();
  return client.reservation.findFirst({
    where: {
      id,
      table: {
        restaurantId
      }
    }
  });
};

export const deleteReservationById = async (id: number) => {
  const client = getPrismaClient();
  return client.reservation.delete({
    where: {
      id
    }
  });
};
