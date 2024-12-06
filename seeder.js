import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Create 100 categories
  for (let i = 0; i < 100; i++) {
    await prisma.category.create({
      data: {
        category_name: faker.commerce.department(),
      },
    });

    await prisma.subCategory.create({
      data: {
        sub_category_name: faker.commerce.productAdjective(),
      },
    });

    await prisma.specificSubCategory.create({
      data: {
        specific_sub_category_name: faker.commerce.product(),
      },
    });
  }

  console.log('100 Categories, SubCategories, and SpecificSubCategories created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
