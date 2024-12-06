import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  const subCategories = await prisma.subCategory.findMany();

  for (const product of products) {
    const selectedSubCategories = getRandomItems(subCategories, 3, 5);

    for (const subCategory of selectedSubCategories) {
      await prisma.productSubCategory.create({
        data: {
          product_id: product.product_id,
          sub_category_id: subCategory.sub_category_id,
        },
      });
    }

    console.log(`Added subcategories to product ${product.product_id}`);
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
