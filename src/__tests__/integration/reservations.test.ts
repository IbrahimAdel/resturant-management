import {getPrismaClient} from "../../orm/PrismaHandler";
import {DEFAULT_EMAIL_SEED, DEFAULT_PASSWORD_SEED} from "../../orm/constants";
import supertest from 'supertest';
import * as expressApp from '../../server';

describe('test suit for reservations', () => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const prisma = getPrismaClient();
  let app = expressApp.default
  let tables: any[] = [];

  beforeAll(() => {
    app = expressApp.default;
  })

  afterEach(() => {
    const promises = [
      prisma.reservation.deleteMany()
    ];
    return prisma.$transaction(promises)
  });

  afterAll(() => {
    return prisma.$transaction([
      prisma.reservation.deleteMany(),
      prisma.table.deleteMany(),
      prisma.user.deleteMany(),
      prisma.restaurant.deleteMany(),
    ]).then(() => app && app.close());
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
    tables.push(createdTable);

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

  it('should test retrieving reservations for admins', async () => {
    const loginRes = await supertest(app)
      .post('/auth/login')
      .send({ email: DEFAULT_EMAIL_SEED, password: DEFAULT_PASSWORD_SEED })
    expect(loginRes.status).toEqual(200);
    expect(loginRes.body.accessToken).toBeTruthy();
    let accessToken = loginRes.body.accessToken;
    const successList = await supertest(app)
      .get('/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    expect(successList.status).toEqual(200);

    const createUser = await supertest(app)
      .post('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'test@test.com', password: '123456', number: '3333', name: 'test' })
    expect(createUser.status).toEqual(200);

    const login2 = await supertest(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123456' })
    expect(login2.status).toEqual(200);
    expect(login2.status).toEqual(200);
    accessToken = login2.body.accessToken;

    const failList = await supertest(app)
      .get('/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    expect(failList.status).toEqual(403);
  });

  it('should test deleting reservations', async () => {
    const loginRes = await supertest(app)
      .post('/auth/login')
      .send({ email: DEFAULT_EMAIL_SEED, password: DEFAULT_PASSWORD_SEED })
    expect(loginRes.status).toEqual(200);
    expect(loginRes.body.accessToken).toBeTruthy();
    const accessToken = loginRes.body.accessToken;

    // adding reservation in the past
    const pastReservation = await prisma.reservation.create({
      data: {
        tableId: tables[0].id,
        from: new Date(new Date(Date.now() - ONE_DAY).setHours(13, 0, 0, 0)),
        to: new Date(new Date(Date.now() - ONE_DAY).setHours(14, 0, 0, 0))
      }
    })
    const deleted = await supertest(app)
      .delete(`/reservations/${pastReservation.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
    expect(deleted.status).toEqual(400);
    expect(deleted.body.message).toEqual('can not delete reservations in the past');

    const futureReservation = await prisma.reservation.create({
      data: {
        tableId: tables[0].id,
        from: new Date(new Date(Date.now() + ONE_DAY).setHours(13, 0, 0, 0)),
        to: new Date(new Date(Date.now() + ONE_DAY).setHours(14, 0, 0, 0))
      }
    })
    const deleted2 = await supertest(app)
      .delete(`/reservations/${futureReservation.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
    expect(deleted2.status).toEqual(400);
    expect(deleted2.body.message).toEqual('can not delete reservations in coming days');

    const sameDayReservation = await prisma.reservation.create({
      data: {
        tableId: tables[0].id,
        from: new Date(new Date(Date.now()).setHours(23, 0, 0, 0)),
        to: new Date(new Date(Date.now()).setHours(23, 59, 59, 0))
      }
    })
    const deleted3 = await supertest(app)
      .delete(`/reservations/${sameDayReservation.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
    if (sameDayReservation.to > new Date()) {
      expect(deleted3.status).toEqual(200);
      expect(deleted3.body.id).toBeTruthy();
    } else {
      expect(deleted.status).toEqual(400);
      expect(deleted.body.message).toEqual('can not delete reservations in the past');
    }
  });

  it('should test the retrieval of available slots for reservation', async () => {
    const loginRes = await supertest(app)
      .post('/auth/login')
      .send({ email: DEFAULT_EMAIL_SEED, password: DEFAULT_PASSWORD_SEED })
    expect(loginRes.status).toEqual(200);
    expect(loginRes.body.accessToken).toBeTruthy();

    const accessToken = loginRes.body.accessToken;
    // resetting tables
    await prisma.table.deleteMany();
    tables = [];

    const createdTableRes1 = await supertest(app)
      .post('/tables')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ number: 100, capacity: 2 });
    expect(createdTableRes1.status).toEqual(200);
    tables.push(createdTableRes1.body);

    const createdTableRes2 = await supertest(app)
      .post('/tables')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ number: 200, capacity: 2 });
    expect(createdTableRes2.status).toEqual(200);
    tables.push(createdTableRes2.body);

    const createdTableRes3 = await supertest(app)
      .post('/tables')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ number: 300, capacity: 2 });
    expect(createdTableRes3.status).toEqual(200);
    tables.push(createdTableRes3.body);
    const from = new Date(new Date(Date.now()).setHours(22, 0, 0, 0))
    const to = new Date(new Date(Date.now()).setHours(23, 59, 59, 0))
    const reservation = {
      tableId: tables[0].id,
      from,
      to
    }
    await prisma.reservation.create({
      data: reservation
    });
    const availableRes1 = await supertest(app)
      .get('/reservations/available')
      .query({requiredSeats: 2})
      .query({from})
      .query({to})
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    let expectedFrom = from > new Date() ? from : new Date()
    expect(availableRes1.status).toEqual(200);
    expect(availableRes1.body.length).toEqual(1);
    expect(new Date(availableRes1.body[0].from)).toEqual(expectedFrom)
    expect(new Date(availableRes1.body[0].to)).toEqual(to)

    // creating a second reservation at the second table
    reservation.tableId = tables[1].id;
    await prisma.reservation.create({
      data: reservation
    });
    const availableRes2 = await supertest(app)
      .get('/reservations/available')
      .query({requiredSeats: 2})
      .query({from})
      .query({to})
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    expectedFrom = from > new Date() ? from : new Date();
    expect(availableRes2.status).toEqual(200);
    expect(availableRes2.body.length).toEqual(1);
    expect(new Date(availableRes2.body[0].from)).toEqual(expectedFrom)
    expect(new Date(availableRes2.body[0].to)).toEqual(to)

    reservation.tableId = tables[2].id;
    await prisma.reservation.create({
      data: reservation
    });
    const availableRes3 = await supertest(app)
      .get('/reservations/available')
      .query({requiredSeats: 2})
      .query({from})
      .query({to})
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
    expect(availableRes3.body.length).toEqual(0);
    expect(availableRes3.status).toEqual(200);

    const createdTableRes4 = await supertest(app)
      .post('/tables')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ number: 400, capacity: 2 });
    expect(createdTableRes4.status).toEqual(200);
    tables.push(createdTableRes4.body);

    const availableRes4 = await supertest(app)
      .get('/reservations/available')
      .query({requiredSeats: 2})
      .query({from})
      .query({to})
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    expectedFrom = from > new Date() ? from : new Date();
    expect(availableRes4.status).toEqual(200);
    expect(availableRes4.body.length).toEqual(1);
    expect(new Date(availableRes4.body[0].from)).toEqual(expectedFrom)
    expect(new Date(availableRes4.body[0].to)).toEqual(to)

    const availableRes5 = await supertest(app)
      .get('/reservations/available')
      .query({requiredSeats: 5})
      .query({from})
      .query({to})
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    expect(availableRes5.status).toEqual(400);
    expect(availableRes5.body.name).toEqual('Capacity Error');
  });
});