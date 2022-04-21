import {getPrismaClient} from "../orm/PrismaHandler";
import CreateTableDto from "../controllers/admin/DTOs/create.table.dto";
import {getEndOfTheDay, getStartOfTheDay} from "../controllers/reservations/utilities/date.utilities";

export const getTableByNumberAndRestaurantId = async (tableNumber: number, restaurantId: number) => {
  const client = getPrismaClient();
  return client.table.findUnique({
    where: {
      restaurantId_number: {
        restaurantId,
        number: tableNumber
      }
    }
  });
};

export const createTable = async (table: CreateTableDto) => {
  const client = getPrismaClient();
  return client.table.create({
    data: {
      capacity: table.capacity,
      restaurantId: table.restaurantId,
      number: table.number
    }
  });
};

export const deleteTable = async (tableNumber: number, restaurantId: number) => {
  const client = getPrismaClient();
  return client.table.delete({
    where: {
      restaurantId_number: {
        number: tableNumber,
        restaurantId
      }
    }
  });
};

export const getMinimumCapacity = (restaurantId: number, minimumSeats: number) => {
  const client = getPrismaClient();
  return client.table.aggregate({
    where: {
      restaurantId,
      capacity: {
        gte: minimumSeats
      }
    },
    _min: {
      capacity: true
    }
  }).then((res) => res._min.capacity);
};

export const getTablesWithExactCapacityIncludingReservations = async (
  restaurantId: number, capacity: number, from: Date, to: Date
) => {
  const client = getPrismaClient();
  return client.table.findMany({
    where: {
      capacity,
      reservations: {
        some: {
          OR: [
            {
              from: {
                lte: getEndOfTheDay(from),
                gte: from
              }
            },
            {
              to: {
                lte: to,
                gte: getStartOfTheDay(to)
              }
            },
          ]
        }
      }
    },
    include: {
      reservations: {
        orderBy: [{ from: 'asc' }]
      },
    }
  });
};
