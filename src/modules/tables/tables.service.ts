import {createTable, deleteTable, getAllTablesForRestaurant} from "../../DAL/table.dal";
import CreateTableDto from "./DTOs/create.table.dto";
import {validateCreateTable, validateDeleteTable} from "./validators/validator";

export async function getAllTablesByRestaurantId(restaurantId: number) {
  return getAllTablesForRestaurant(restaurantId)
}

export async function createTableInRestaurant(restaurantId: number, tableNumber: number, capacity: number) {
  const tableDto: CreateTableDto = {
    number: tableNumber,
    capacity,
    restaurantId
  };
  await validateCreateTable(tableDto);
  return createTable(tableDto);
}

export async function deleteTableInRestaurant(restaurantId: number, tableNumber: number) {
  await validateDeleteTable(+tableNumber, restaurantId);
  return deleteTable(+tableNumber, restaurantId);
}