import {getPrismaClient} from "../orm/PrismaHandler";
import {getEndOfTheDay, getStartOfTheDay} from "../controllers/reservations/utilities/date.utilities";

export const getFreeSlotsForDateRange = async (
  from: Date, to: Date, minimumSeats: number, restaurantId: number, limit: number, offset: number
) => {
  const client = getPrismaClient();
  const minimumCapacity = await getMinimumCapacity(restaurantId);
  const countOptions = {
    where: {
      restaurantId,
      capacity: Math.max(minimumCapacity, minimumSeats)
    }
  };
  const count = await client.table.count(countOptions);
  const options = {
    where: {
      restaurantId,
      capacity: Math.max(minimumCapacity, minimumSeats)
    },
    take: limit,
    skip: offset,
    include: {
      reservations: {
        where: {
          from: {
            gte: from,
            lte: getEndOfTheDay()
          },
          to: {
            lte: to,
            gte: getStartOfTheDay()
          }
        }
      }
    }
  };
  const rows = await client.table.findMany(options);
  return { count, rows };
};

export const getMinimumCapacity = (restaurantId: number) => {
  const client = getPrismaClient();
  return client.table.aggregate({
    where: {
      restaurantId
    },
    _min: {
      capacity: true
    }
  }).then((res) => res._min.capacity);
};
