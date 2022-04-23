import {createNonAdminUser, getAllUsers} from "../../DAL/user.dal";
import CreateUserDTO from "./DTOs/create.user.dto";
import {validateCreateUser} from "../tables/validators/validator";
import bcrypt from "bcrypt";

export function getAllUsersInRestaurant(restaurantId: number) {
  return getAllUsers(restaurantId);
}

export async function addUserInRestaurant(restaurantId: number, email: string, name: string, password: string, userNumber: string) {
  const userDTO: CreateUserDTO = {
    name,
    email: email.toLowerCase(),
    password,
    restaurantId,
    number: userNumber
  };
  await validateCreateUser(userDTO);
  const salt = await bcrypt.genSalt(10);
  userDTO.password = await bcrypt.hash(password, salt);
  const createdUser = await createNonAdminUser(userDTO);
  delete createdUser.password;
  return createdUser;
}