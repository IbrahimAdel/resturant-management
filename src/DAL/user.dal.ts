import { getPrismaClient } from "../orm/PrismaHandler";

export const getUserRole = (email: string) => {
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
