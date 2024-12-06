import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();

  // Loop untuk setiap produk yang sudah ada
  for (const product of products) {
    // Generate 3 hingga 5 gambar kategori untuk setiap produk
    const categoryImages = Array.from({ length: faker.number.int({ min: 3, max: 5 }) }).map(() => ({
      url: faker.image.url(),
    }));

    // Tambahkan gambar kategori ke produk yang ada
    await prisma.image.createMany({
      data: categoryImages.map((image) => ({
        image_url: image.url,
        product_id: product.product_id, // Kaitkan gambar dengan produk yang ada
      })),
    });

    console.log(`Added category images to product ${product.product_id}`);
  }

  console.log("Category images added to products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
