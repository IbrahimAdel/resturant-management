import CreateUserDTO from '../../users/DTOs/create.user.dto';
import { BaseError, ErrorInput } from '../../../errors/errros';
import { getUserIdByEmail } from '../../../DAL/user.dal';
import CreateTableDto from '../DTOs/create.table.dto';
import { getTableByNumberAndRestaurantId } from '../../../DAL/table.dal';
import { getFutureReservationCountForTable } from '../../../DAL/reservation.dal';
import {validateEmail} from "../../../utils/general.validator";

export async function validateCreateUser(user: CreateUserDTO) {
  if (user.password.trim().length < 6) {
    const input: ErrorInput = {
      message: 'password should be at least 6 characters',
      code: 400,
      name: 'Password Error'
    };
    throw new BaseError(input);
  }

  const numberRegex = /^[0-9]{4}$/;
  if (!numberRegex.test(user.number)) {
    const input: ErrorInput = {
      message: 'user number should consist only of numbers and be of 4 length',
      code: 400,
      name: 'User Number Error'
    };
    throw new BaseError(input);
  }

  const isValid = validateEmail(user.email);
  if (!isValid) {
    const input: ErrorInput = {
      message: 'invalid Email',
      code: 400,
      name: 'Invalid Email Error'
    };
    throw new BaseError(input);
  }

  const emailExist = await getUserIdByEmail(user.email);
  if (emailExist) {
    const input: ErrorInput = {
      message: 'email is already registered',
      code: 400,
      name: 'Duplicate Email'
    };
    throw new BaseError(input);
  }
}

export async function validateCreateTable(table: CreateTableDto) {
  if (table.number < 0) {
    const input: ErrorInput = {
      message: `table number shouldn't be negative`,
      code: 400,
      name: 'Table Number Error'
    };
    throw new BaseError(input);
  }

  if (table.capacity < 1 || table.capacity > 12) {
    const input: ErrorInput = {
      message: `table capacity can only be from 1 and 12`,
      code: 400,
      name: 'Table Number Error'
    };
    throw new BaseError(input);
  }

  const existingTable = await getTableByNumberAndRestaurantId(table.number, table.restaurantId);
  if (existingTable) {
    const input: ErrorInput = {
      message: `table with number '${table.number}' is already created`,
      code: 400,
      name: 'Table Number Error'
    };
    throw new BaseError(input);
  }
}

export async function validateDeleteTable(tableNumber: number, restaurantId: number) {
  const table = await getTableByNumberAndRestaurantId(tableNumber, restaurantId);
  if (!table) {
    const input: ErrorInput = {
      message: `table with number '${tableNumber}' doesn't exist`,
      code: 400,
      name: 'Table Number Error'
    };
    throw new BaseError(input);
  }
  const futureReservationsCount = await getFutureReservationCountForTable(table.id);
  if (futureReservationsCount > 0) {
    const input: ErrorInput = {
      message: `table with number '${tableNumber}' has ${futureReservationsCount} future reservation`,
      code: 400,
      name: 'Table Future Reservations Error'
    };
    throw new BaseError(input);
  }
}
