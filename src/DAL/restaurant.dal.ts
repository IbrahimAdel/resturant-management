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

export const createRestaurantWithAdmin = async (restaurantName: string, name: string, email: string, hashedPassword: string) => {
  const client = await getPrismaClient();
  return client.restaurant
    .create({
      data: {
        name: restaurantName,
        users: {
          create: {
            email,
            password: hashedPassword,
            role: 'Admin',
            name
          }
        }
      }
    });
}
