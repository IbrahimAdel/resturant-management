import {getPrismaClient} from "../orm/PrismaHandler";
import CreateTableDto from "../controllers/admin/DTOs/create.table.dto";

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
