import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();



async function main() {
  // Fetch all categories, subcategories, and specific subcategories
  const categories = await prisma.category.findMany();
  const subCategories = await prisma.subCategory.findMany();
  const specificSubCategories = await prisma.specificSubCategory.findMany();

  for (let i = 0; i < 100; i++) {
    const randomCategories = getRandomItems(categories, 3, 5);
    const randomSubCategories = getRandomItems(subCategories, 3, 5);
    const randomSpecificSubCategories = getRandomItems(specificSubCategories, 3, 5);

    await prisma.product.create({
      data: {
        pName: faker.commerce.productName(),
        sale: faker.datatype.boolean(),
        discount: faker.number.float({ min: 0, max: 100 }),
        location: faker.address.city(),
        weight: faker.number.float({ min: 0.1, max: 10 }),
        price: faker.number.float({ min: 10, max: 1000 }),
        brand: faker.company.name(),
        desc: faker.lorem.paragraph(),
        categories: {
          create: randomCategories.map((category) => ({
            category: {
              connect: { id: category.id },
            },
          })),
        },
        subcategories: {
          create: randomSubCategories.map((subcategory) => ({
            subcategory: {
              connect: { id: subcategory.id },
            },
          })),
        },
        specificSubCategories: {
          create: randomSpecificSubCategories.map((specificSubCategory) => ({
            specificSubCategory: {
              connect: { id: specificSubCategory.id },
            },
          })),
        },
        stock: {
          create: [
            {
              size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
              quantity: faker.number.int({ min: 1, max: 100 }),
            },
          ],
        },
        images: {
          create: Array.from({ length: faker.number.int({ min: 3, max: 5 }) }).map(() => ({
            url: faker.image.url(),
          })),
        },
        ratings: {
          create: [
            {
              value: faker.number.int({ min: 1, max: 5 }),
              review: faker.lorem.sentence(),
              user: {
                connect: { id: faker.number.int({ min: 1, max: 100 }) }, // Assuming 100 users already exist
              },
            },
          ],
        },
      },
    });

    console.log(`Created product ${i + 1}/100`);
  }
}

function getRandomItems(array, min, max) {
  const count = faker.number.int({ min, max });
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
