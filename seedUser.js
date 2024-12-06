import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash("123", salt);

  for (let i = 0; i < 90; i++) {
    await prisma.user.create({
      data: {
        nama: faker.person.fullName(),
        profileImage: faker.image.avatar(),
        email: faker.internet.email(),
        password: hashedPassword,
        tanggalLahir: faker.date.past(30, new Date(2000, 0, 1)),
        gender: faker.helpers.arrayElement(['male', 'female']),
      },
    });
  }

  console.log("90 users created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
