import { getPrismaClient } from '../orm/PrismaHandler';
import CreateUserDTO from '../controllers/admin/DTOs/create.user.dto';

export const getUserRoleFromDB = (email: string) => {
  const client = getPrismaClient();
  return client.user
    .findUnique({
      where: {
        email
      },
      select: {
        role: true
      }
    }).then((user) => user.role);
};

export const createNonAdminUser = (createUserDTO: CreateUserDTO) => {
  const client = getPrismaClient();
  return client.user.create({
    data: createUserDTO
  });
};

export const getUserIdByEmail = (email: string) => {
  const client = getPrismaClient();
  return client.user
    .findUnique({
      where: {
        email
      },
      select: {
        id: true
      }
    }).then((user) => user?.id);
};
