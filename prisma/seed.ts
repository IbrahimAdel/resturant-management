import {Prisma, PrismaClient} from '@prisma/client'
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient()


async function main() {
  console.log(`Start seeding ...`)
  await createDefaultRestaurant();
  console.log(`Seeding finished.`)
}

async function createDefaultRestaurant() {
  const password = '123456';
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);
  const email = 'ibrahim@gmail.com';
  const exists = prisma.user.findUnique({
    where: {
      email
    },
    select: {
      id: true
    }
  }).then((user) => !!user);
  if (!exists) {
    const restaurantData: Prisma.RestaurantCreateArgs = {
      data: {
        name: 'McDonalds 2.0 Cuz 1.0 Sucks',
        users: {
          create: {
            email: 'ibrahim@gmail.com',
            role: 'Admin',
            name: 'ibrahim Hussein',
            password: hashedPass
          }
        }
      }
    }
    const restaurant = await prisma.restaurant.create(restaurantData)
    console.log(`Created restaurant with id: ${restaurant.id}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })