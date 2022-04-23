import {Prisma, PrismaClient} from '@prisma/client'
import bcrypt from 'bcrypt';
import {DEFAULT_EMAIL_SEED, DEFAULT_PASSWORD_SEED} from "./constants";

const prisma = new PrismaClient()

const generateDefaultUser = async (): Promise<Prisma.RestaurantCreateArgs> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(DEFAULT_PASSWORD_SEED, salt);
  return {
    data: {
      name: `McDonald's 2.0 Cuz 1.0 Sucks`,
      users: {
        create: {
          email: DEFAULT_EMAIL_SEED,
          role: 'Admin',
          name: 'ibrahim Hussein',
          password: hashedPass
        }
      }
    }
  }
}

async function main() {
  console.log(`Start seeding ...`)
  await createDefaultRestaurant();
  console.log(`Seeding finished.`)
}

async function createDefaultRestaurant() {
  const exists = await prisma.user.findUnique({
    where: {
      email: DEFAULT_EMAIL_SEED
    },
    select: {
      id: true
    }
  }).then((user) => !!user);
  if (!exists) {
    const data = await generateDefaultUser();
    const restaurant = await prisma.restaurant.create(data)
    console.log(`Created restaurant with id: ${restaurant.id}`)
    console.log(`email: ${DEFAULT_EMAIL_SEED}. password: ${DEFAULT_PASSWORD_SEED}`)
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