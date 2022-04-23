import {getPrismaClient} from "../../orm/PrismaHandler";
import {getUserByEmail} from "../../DAL/user.dal";
import {DEFAULT_EMAIL_SEED} from "../../orm/constants";
import {createTable} from "../../DAL/table.dal";
import {createReservationByTableNumber} from "../../DAL/reservation.dal";

describe('test suit for reservations', () => {
  const prisma = getPrismaClient();
  let user;
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    const promises = [
      prisma.reservation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.table.deleteMany(),
      prisma.restaurant.deleteMany()
    ];
    await prisma.$transaction(promises);
    await prisma.$disconnect();
  });

  it('it should create one reservation for the only table available for capacity 2 and deny one reservation in the same time', async  () => {
    // created from seed
    user = await getUserByEmail(DEFAULT_EMAIL_SEED);
    expect(!!user).toBeTruthy();
    const {restaurantId} = user;
    expect(user.restaurantId > 0).toBeTruthy();
    const table = await createTable({
      restaurantId,
      number: 1,
      capacity: 2
    });
    expect(table).toBeTruthy();
    const from = new Date('2023-04-22T15:00:00');
    const to = new Date('2023-04-22T15:30:00');
    const reservation1 = await createReservationByTableNumber(table.number, restaurantId, from, to);
    expect(reservation1).toBeTruthy();
  });
});