

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  const categories = await prisma.category.findMany();

  for (const product of products) {
    const selectedCategories = getRandomItems(categories, 3, 5);

    for (const category of selectedCategories) {
      await prisma.productCategory.create({
        data: {
          product_id: product.product_id,
          category_id: category.category_id,
        },
      });
    }

    console.log(`Added categories to product ${product.product_id}`);
  }
}

function getRandomItems(array, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
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
