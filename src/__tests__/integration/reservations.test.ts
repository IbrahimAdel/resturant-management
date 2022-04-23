import {getPrismaClient} from "../../orm/PrismaHandler";
import {DEFAULT_EMAIL_SEED, DEFAULT_PASSWORD_SEED} from "../../orm/constants";
import supertest from 'supertest';
import * as expressApp from '../../server';

describe('test suit for reservations', () => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const prisma = getPrismaClient();
  let app = expressApp.default

  beforeAll(() => {
    app = expressApp.default;
  })

  afterEach(() => {
    const promises = [
      prisma.reservation.deleteMany(),
      prisma.table.deleteMany(),
    ];
    return prisma.$transaction(promises)
  }, 500);

  afterAll(() => {

    return app && app.close();
  })

  it('it should test the create reservation functionality', async  () => {
    // created from seed

    const loginRes = await supertest(app)
      .post('/auth/login')
      .send({ email: DEFAULT_EMAIL_SEED, password: DEFAULT_PASSWORD_SEED })
    expect(loginRes.status).toEqual(200);
    expect(loginRes.body.accessToken).toBeTruthy();
    const accessToken = loginRes.body.accessToken;
    const createdTableRes = await supertest(app)
      .post('/tables')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ number: 1, capacity: 2 });
    expect(createdTableRes.status).toEqual(200);
    const createdTable = createdTableRes.body

    let from = new Date(Date.now() + ONE_DAY).setHours(15, 0, 0, 0);
    let to = new Date(Date.now() + ONE_DAY).setHours(16, 0, 0, 0);
    const successReservation = await supertest(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({from, to, tableNumber: createdTable.number});
    expect(successReservation.status).toEqual(200);

    // same time as successReservation
    const failedDueSameTime = await supertest(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({from, to, tableNumber: createdTable.number});
    expect(failedDueSameTime.status).toEqual(400);
    expect(failedDueSameTime.body.name).toEqual('Reservation Error');

    // end is before start
    from = new Date(Date.now() + ONE_DAY).setHours(13, 0, 0, 0);
    to = new Date(Date.now() + ONE_DAY).setHours(12, 30, 0, 0);
    const failedDueInvalidTimeInput1 = await supertest(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({from, to, tableNumber: createdTable.number});
    expect(failedDueInvalidTimeInput1.status).toEqual(400);
    expect(failedDueInvalidTimeInput1.body.message).toEqual(`'to' has to be after 'from'`);

    from = new Date(Date.now() + ONE_DAY).setHours(11, 0, 0, 0);
    to = new Date(Date.now() + ONE_DAY).setHours(12, 30, 0, 0);
    const failedDueInvalidTimeInput2 = await supertest(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({from, to, tableNumber: createdTable.number});
    expect(failedDueInvalidTimeInput2.status).toEqual(400);
    expect(failedDueInvalidTimeInput2.body.message).toEqual(`'from' has to be in working hours`);

    from = new Date(Date.now() + ONE_DAY).setHours(22, 0, 0, 0);
    to = new Date(Date.now() + ONE_DAY).setHours(25, 30, 0, 0);
    const failedDueInvalidTimeInput3 = await supertest(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({from, to, tableNumber: createdTable.number});
    expect(failedDueInvalidTimeInput3.status).toEqual(400);
    expect(failedDueInvalidTimeInput3.body.message).toEqual(`'to' has to be in the same day as 'from'`);
  });
});