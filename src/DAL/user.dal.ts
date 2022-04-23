import {getPrismaClient} from '../orm/PrismaHandler';
import CreateUserDTO from '../controllers/users/DTOs/create.user.dto';

export const getAllUsers = (restaurantId: number) => {
  // TODO needs pagination for scaling, fine for now as it is not required
  const client = getPrismaClient();
  return client.user.findMany({
    where: {
      restaurantId
    },
    // to exclude password
    select: {
      id: true,
      createdAt: true,
      email: true,
      number: true,
      name: true,
      role: true,
      restaurantId: true,
    }
  })
};

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

export const isEmailRegistered = (email: string) => {
  const client = getPrismaClient();
  return client.user.findMany({
    where: {
      email: {
        equals: email,
        mode: 'insensitive'
      }
    },
    select: {
      id: true
    }
  }).then((users) => (users.length !== 0))
}

export const getUserByEmail = (email: string) => {
  const client = getPrismaClient();
  return client.user.findUnique({
    where: {
      email
    }
  }).then((user) => {
    if (user) delete user.password;
    return user;
  })
}
