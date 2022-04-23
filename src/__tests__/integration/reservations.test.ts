import {getPrismaClient} from "../../orm/PrismaHandler";
import {getUserByEmail} from "../../DAL/user.dal";
import {DEFAULT_EMAIL_SEED} from "../../orm/constants";

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

  it('should get empty array as reservation as none is created yet', async  () => {
    // created from seed
    user = await getUserByEmail(DEFAULT_EMAIL_SEED);
    console.log(user)
    expect(!!user).toBeTruthy();
    expect(user.restaurantId > 0).toBeTruthy();
  });
});