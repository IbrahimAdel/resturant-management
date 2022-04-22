import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient;

export const getPrismaClient = () => {
  if (prismaClient) {
    return prismaClient;
  }
  prismaClient = new PrismaClient({
    rejectOnNotFound: false,

  });
  return prismaClient;
};
