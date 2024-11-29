import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Menampilkan daftar produk favorit user
export const getUserFavorites = async (req, res) => {
  const userId = req.userId; 
  try {
    const favorites = await prisma.favorite.findMany({
      where: { user_id: userId },
      include: { product: true }, 
    });
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error });
  }
};

// Menambah produk ke daftar favorit
export const addToFavorites = async (req, res) => {
  const userId = req.userId; 
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
  const userId = req.userId; 
  const { productId } = req.body;
  try {
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
