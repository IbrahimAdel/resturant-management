import {getPrismaClient} from "../orm/PrismaHandler";

export const getFutureReservationCountForTable = (tableId: number) => {
  const client = getPrismaClient();
  return client.reservation.count({
    where: {
      tableId,
      OR: [
        {
          from: {
            gt: new Date()
          }
        },
        {
          to: {
            gt: new Date()
          }
        }
      ]
    }
  });
};
