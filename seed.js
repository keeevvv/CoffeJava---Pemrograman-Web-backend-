
import { PrismaClient } from '@prisma/client';

import { faker } from '@faker-js/faker';
const prisma = new PrismaClient();

async function main() {
  // Generate 20 categories
  const categories = [];
  for (let i = 0; i < 20; i++) {
    const category = await prisma.category.create({
      data: {
        category_name: faker.commerce.department(),
      },
    });
    categories.push(category);
  }

  // Generate 20 subcategories
  const subCategories = [];
  for (let i = 0; i < 20; i++) {
    const subCategory = await prisma.subCategory.create({
      data: {
        sub_category_name: faker.commerce.department(),
      },
    });
    subCategories.push(subCategory);
  }

  // Generate 20 specific subcategories
  const specificSubCategories = [];
  for (let i = 0; i < 20; i++) {
    const specificSubCategory = await prisma.specificSubCategory.create({
      data: {
        specific_sub_category_name: faker.commerce.productMaterial(),
      },
    });
    specificSubCategories.push(specificSubCategory);
  }

  // Generate 20 products
  const products = [];
  for (let i = 0; i < 20; i++) {
    const product = await prisma.product.create({
      data: {
        pName: faker.commerce.productName(),
        location: faker.location.city(),
        weight: parseFloat(faker.commerce.price(1, 100, 2)),
      },
    });
    products.push(product);
  }

  // Create 20 product-category relationships
  for (const product of products) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    await prisma.productCategory.create({
      data: {
        product_id: product.product_id,
        category_id: randomCategory.category_id,
      },
    });
  }

  // Create 20 product-subcategory relationships
  for (const product of products) {
    const randomSubCategory = subCategories[Math.floor(Math.random() * subCategories.length)];
    await prisma.productSubCategory.create({
      data: {
        product_id: product.product_id,
        sub_category_id: randomSubCategory.sub_category_id,
      },
    });
  }

  // Create 20 product-specific subcategory relationships
  for (const product of products) {
    const randomSpecificSubCategory = specificSubCategories[Math.floor(Math.random() * specificSubCategories.length)];
    await prisma.productSpecificSubCategory.create({
      data: {
        product_id: product.product_id,
        specific_sub_category_id: randomSpecificSubCategory.specific_sub_category_id,
      },
    });
  }

  // Generate 20 stocks
  const sizes = ["S", "M", "L", "XL"];
  for (const product of products) {
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    await prisma.stock.create({
      data: {
        product_id: product.product_id,
        size,
        quantity:faker.number.int({ min: 1, max: 100 }),
        
      },
    });
  }

  // Generate 20 images
  for (const product of products) {
    await prisma.image.create({
      data: {
        product_id: product.product_id,
        image_url: faker.image.url(),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
