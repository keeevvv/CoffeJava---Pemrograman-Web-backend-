import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany(); // Ambil semua produk
  const users = await prisma.user.findMany(); // Ambil semua user

  for (const product of products) {
    // Tentukan jumlah rating antara 3 hingga 10 secara acak
    const numRatings = faker.number.int({ min: 3, max: 10 });

    const ratings = Array.from({ length: numRatings }).map(() => ({
      value: faker.number.int({ min: 1, max: 5, precision: 0.1 }), // Rating antara 1.0 - 5.0
      review: faker.lorem.sentence(), // Ulasan acak
      product_id: product.product_id,
      user_id: users[faker.number.int({ min: 0, max: users.length - 1 })].id, // Pilih acak user dari daftar user
      createdAt: faker.date.past(), // Tanggal acak di masa lalu
    }));

    // Buat rating di database
    await prisma.rating.createMany({
      data: ratings,
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
