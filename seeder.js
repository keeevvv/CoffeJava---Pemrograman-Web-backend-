import { PrismaClient } from "@prisma/client";

import { faker } from "@faker-js/faker";
const prisma = new PrismaClient();
const updateExistingProducts = async () => {
    // Ambil semua produk yang sudah ada di database
    const products = await prisma.product.findMany();
  
    // Ambil kategori, subkategori, dan specific subkategori
    const categories = await prisma.category.findMany();
    const subcategories = await prisma.subCategory.findMany();
    const specificSubcategories = await prisma.specificSubCategory.findMany();
  
    // Ukuran stok
    const sizes = ["S", "M", "L", "XL"];
  
    for (const product of products) {
      // 1. Assign 3 kategori acak ke produk
      const randomCategories = [];
      while (randomCategories.length < 3) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        // Cek jika kombinasi product_id dan category_id sudah ada
        const existingCategory = await prisma.productCategory.findFirst({
          where: {
            product_id: product.product_id,
            category_id: randomCategory.category_id
          }
        });
  
        if (!existingCategory) {
          randomCategories.push(randomCategory.category_id);
          await prisma.productCategory.create({
            data: {
              product_id: product.product_id,
              category_id: randomCategory.category_id,
            },
          });
        }
      }
  
      // 2. Assign 3 subkategori acak ke produk
      const randomSubcategories = [];
      while (randomSubcategories.length < 3) {
        const randomSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
  
        // Cek jika kombinasi product_id dan sub_category_id sudah ada
        const existingSubCategory = await prisma.productSubCategory.findFirst({
          where: {
            product_id: product.product_id,
            sub_category_id: randomSubcategory.sub_category_id
          }
        });
  
        if (!existingSubCategory) {
          randomSubcategories.push(randomSubcategory.sub_category_id);
          await prisma.productSubCategory.create({
            data: {
              product_id: product.product_id,
              sub_category_id: randomSubcategory.sub_category_id,
            },
          });
        }
      }
  
      // 3. Assign 3 specific subkategori acak ke produk
      const randomSpecificSubcategories = [];
      while (randomSpecificSubcategories.length < 3) {
        const randomSpecificSubcategory = specificSubcategories[Math.floor(Math.random() * specificSubcategories.length)];
  
        // Cek jika kombinasi product_id dan specific_sub_category_id sudah ada
        const existingSpecificSubCategory = await prisma.productSpecificSubCategory.findFirst({
          where: {
            product_id: product.product_id,
            specific_sub_category_id: randomSpecificSubcategory.specific_sub_category_id
          }
        });
  
        if (!existingSpecificSubCategory) {
          randomSpecificSubcategories.push(randomSpecificSubcategory.specific_sub_category_id);
          await prisma.productSpecificSubCategory.create({
            data: {
              product_id: product.product_id,
              specific_sub_category_id: randomSpecificSubcategory.specific_sub_category_id,
            },
          });
        }
      }
  
      // 4. Menggunakan upsert untuk menambah atau memperbarui stok untuk produk
      for (let j = 0; j < 3; j++) {
        const size = sizes[Math.floor(Math.random() * sizes.length)];
  
        await prisma.stock.upsert({
          where: {
            product_id_size: {
              product_id: product.product_id,
              size: size,
            },
          },
          update: {
            quantity: faker.number.int({ min: 1, max: 100 }), // Update quantity jika sudah ada
          },
          create: {
            product_id: product.product_id,
            size: size,
            quantity: faker.number.int({ min: 1, max: 100 }), // Buat stok baru jika belum ada
          },
        });
      }
  
      // 5. Membuat 3 gambar untuk setiap produk
      for (let j = 0; j < 3; j++) {
        await prisma.image.create({
          data: {
            product_id: product.product_id,
            image_url: faker.image.url(),
          },
        });
      }
    }
  };
  
  updateExistingProducts()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  
  
