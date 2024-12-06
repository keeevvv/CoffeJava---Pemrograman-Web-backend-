import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany(); // Ambil semua produk yang ada
  const users = await prisma.user.findMany(); // Ambil semua pengguna yang ada

  for (const product of products) {
    const numRatings = faker.number.int({ min: 1, max: 10 }); // Tentukan jumlah rating yang akan ditambahkan, maksimal 10

    // Generate rating untuk produk
    const ratings = Array.from({ length: numRatings }).map(() => ({
      value: (faker.number.int({ min: 1, max: 5 })), // Rating acak dengan satu angka desimal
      review: faker.lorem.sentence(), // Ulasan acak
      user_id: faker.helpers.arrayElement(users).id, // Menghubungkan rating dengan pengguna yang acak
      product_id: product.product_id, // Kaitkan rating dengan produk yang ada (product_id)
    }));

    // Tambahkan rating ke produk menggunakan createMany
    await prisma.rating.createMany({
      data: ratings, // Menambahkan banyak rating sekaligus
    });

    console.log(`Added ${numRatings} ratings to product ${product.product_id}`);
  }

  console.log("Ratings added to products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
