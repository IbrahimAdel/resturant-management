import { getPrismaClient } from '../orm/PrismaHandler';

export const getRestaurantWithAdmin = async (id: number) => {
  const client = getPrismaClient();
  return client.restaurant.findUnique({
    where: {
      id
    },
    include: {
      users: {
        where: {
          role: 'Admin'
        },
        select: {
          email: true,
          role: true
        }
      }
    }
  });
};

export const createRestaurantWithAdmin = async (restaurantName: string, username: string, hashedPassword: string) => await getPrismaClient().restaurant
  .create({
    data: {
      name: restaurantName,
      users: {
        create: {
          email: username,
          password: hashedPassword,
          role: 'Admin'
        }
      }
    }
  });
