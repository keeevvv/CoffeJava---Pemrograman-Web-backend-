import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 100; i++) {
    await prisma.product.create({
      data: {
        pName: faker.commerce.productName(),
        sale: faker.datatype.boolean(),
        discount: faker.number.float({ min: 0, max: 100 }),
        location: faker.location.city(),
        weight: faker.number.float({ min: 0.1, max: 10 }),
        price: faker.number.float({ min: 10, max: 1000 }),
        brand: faker.company.name(),
        desc: faker.commerce.productDescription(),
        stock: {
          create: [
            {
              size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
              quantity: faker.number.int({ min: 1, max: 100 }),
            },
          ],
        },
        
      },
    });
  }

  console.log("100 products created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
