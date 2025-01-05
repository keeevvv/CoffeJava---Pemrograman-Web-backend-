import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

// Menampilkan daftar produk favorit user
export const getUserFavorites = async (req, res) => {
  const userId = jwt.decode(req.headers["authorization"].split(" ")[1]).id;
  try {
    const favorites = await prisma.favorite.findMany({
      where: { user_id: userId },
      include: {
        product: {
          select: {
            product_id: true,
            pName: true,
            sale: true,
            discount: true,
            location: true,
            weight: true,
            price: true,
            brand: true,
            desc: true,
            categories: {
              select: {
                Category: {
                  select: {
                    category_id: true,
                    category_name: true,
                  },
                },
              },
            },
            subcategories: {
              select: {
                SubCategory: {
                  select: {
                    sub_category_id: true,
                    sub_category_name: true,
                  },
                },
              },
            },
            specificSubCategories: {
              select: {
                SpecificSubCategory: {
                  select: {
                    specific_sub_category_id: true,
                    specific_sub_category_name: true,
                  },
                },
              },
            },
            images: {
              select: {
                image_id: true,
                image_url: true,
              },
            },
            ratings: {
              select: {
                rating_id: true,
                value: true,
                review: true,
                user: {
                  select: {
                    nama: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error });
  }
};

// Menambah produk ke daftar favorit
export const addToFavorites = async (req, res) => {
  const userId = jwt.decode(req.headers["authorization"].split(" ")[1]).id;

  const { productId } = req.body;
  try {
    const existing = await prisma.favorite.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    await prisma.favorite.create({
      data: { user_id: userId, product_id: productId },
    });
    res.status(201).json({ message: "Product added to favorites" });
  } catch (error) {
    res.status(500).json({ message: "Error adding to favorites", error });
  }
};

// Menghapus produk dari daftar favorit
export const removeFromFavorites = async (req, res) => {
  const userId = jwt.decode(req.headers["authorization"].split(" ")[1]).id;
  const { productId } = req.body;
  try {
    const favoriteExists = await prisma.favorite.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (!favoriteExists) {
      return res
        .status(404)
        .json({ message: "Product not found in favorites" });
    }

    await prisma.favorite.deleteMany({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });
    res.status(200).json({ message: "Product removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Error removing from favorites", error });
  }
};

// Menghapus produk dari daftar favorit by id
export const removeFavoritesById = async (req, res) => {
  try {
    const userId = jwt.decode(req.headers["authorization"].split(" ")[1]).id;
    const favoriteId = parseInt(req.params["id"]);

    if (!favoriteId || isNaN(favoriteId)) {
      return res.status(400).json({ message: "Invalid favorite ID" });
    }

    const favoriteExists = await prisma.favorite.findUnique({
      where: {
        favorite_id: favoriteId,
      },
    });

    if (!favoriteExists) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    await prisma.favorite.delete({
      where: {
        favorite_id: favoriteId,
      },
    });

    res.status(200).json({ message: "Favorite removed from favorites" });
  } catch (error) {
    console.error("Error detail:", error);
    res.status(500).json({
      message: "Error removing from favorites",
      error: error.message,
    });
  }
};
