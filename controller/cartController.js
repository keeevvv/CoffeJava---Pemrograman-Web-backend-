import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllCart(req, res) {
  const user = req.user;

  try {
    const checkUser = await prisma.user.findFirst({
      where: {
        id: user.id,
        nama: user.nama,
      },
    });

    if (!checkUser) throw new Error("Error, You're Not Signed");

    let data = await prisma.cart.findFirst({
      where: {
        user_id: user.id,
      },
      include: {
        cart_items: {
          select: {
            cart_item_id: true,
            quantity: true,
            total_price: true,
            size: true,
            cart_id: true,
            product: {
              select: {
                product_id: true,
                pName: true,
                price: true,
                brand: true,
                desc: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!data) {
      data = await prisma.cart.create({
        data: {
          user_id: user.id,
        },
        include: {
          cart_items: {
            select: {
              cart_item_id: true,
              quantity: true,
              total_price: true,
              size: true,
              product: {
                product_id: true,
                pName: true,
                price: true,
                brand: true,
                desc: true,
              },
            },
          },
        },
      });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || error });
  }
}

export async function saveCart(req, res) {
  const user = req.user;
  const { quantity, product_id, size } = req.body;

  try {
    const checkUser = await prisma.user.findFirst({
      where: {
        id: user.id,
        nama: user.nama,
      },
    });

    if (!checkUser) throw new Error("Error, You're not signed");

    let cart = await prisma.cart.findFirst({
      where: {
        user_id: user.id,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          user_id: user.id,
        },
      });
    }

    const checkProduct = await prisma.cartItem.findFirst({
      where: {
        product_id,
        cart_id: cart.cart_id,
        size,
      },
    });

    if (checkProduct) {
      return res
        .status(409)
        .json({ msg: "Error, you've already put this item in your cart" });
    }

    const productData = await prisma.product.findUnique({
      where: {
        product_id,
      },
    });

    const stockData = await prisma.stock.findFirst({
      where: {
        product_id,
        size,
      },
    });

    if (!productData) throw new Error("Error, product not found");
    if (!stockData) throw new Error("Error, stock for the specified size not found");
    if (stockData.quantity < quantity) throw new Error("Error, insufficient stock");

    const total_price = quantity * productData.price;

    await prisma.stock.update({
      where: {
        stock_id: stockData.stock_id,
      },
      data: {
        quantity: stockData.quantity - quantity,
      },
    });

    await prisma.cartItem.create({
      data: {
        quantity,
        product_id,
        cart_id: cart.cart_id,
        total_price,
        size,
      },
    });

    res.status(200).json({ success: "Product has been stored in your cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message || "Internal server error" });
  }
}

export async function changeQTY(req, res) {
  const user = req.user;
  const { itemId, qty } = req.body;

  try {
    if (!itemId) throw new Error("Error, itemId is required");

    const checkUser = await prisma.user.findFirst({
      where: {
        id: user.id,
        nama: user.nama,
      },
    });

    if (!checkUser) throw new Error("Error, You're not signed");

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cart_item_id: itemId,
      },
      include: {
        product: {
          select: {
            price: true,
          },
        },
      },
    });

    if (!cartItem) throw new Error("Error, Cart item not found");

    const total_price = qty * cartItem.product.price;

    const data = await prisma.cartItem.update({
      where: {
        cart_item_id: itemId,
      },
      data: {
        quantity: qty,
        total_price,
      },
    });

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || error });
  }
}

export async function updateShippingAddress(req, res) {
  const user = req.user;
  const { id } = req.params;
  const { address, city, country, postal, courier, cost } = req.body;

  try {
    // Make sure the user is valid
    const checkUser = await prisma.user.findFirst({
      where: {
        id: user.id,
        nama: user.nama,
      },
    });

    if (!checkUser) throw new Error("Unauthorized user");

    // Check if the address exists and belongs to the user
    const existing = await prisma.shippingAddress.findFirst({
      where: {
        shipping_id: parseInt(id),  // ✅ use correct field name
        user_id: user.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ msg: "Shipping address not found." });
    }

    // Perform the update
    const updated = await prisma.shippingAddress.update({
      where: {
        shipping_id: parseInt(id),  // ✅ use correct field name
      },
      data: {
        address,
        city,
        country,
        postal,
        courier,
        cost: parseFloat(cost),
      },
    });

    res.status(200).json({ msg: "Shipping address updated successfully", data: updated });
  } catch (error) {
    console.error("Update shipping error:", error);
    res.status(400).json({ error: error.message || "Failed to update shipping address" });
  }
}


export async function deleteAllItem(req, res) {
  const user = req.user;
  const { cart_id } = req.body;

  try {
    const checkUser = await prisma.user.findFirst({
      where: {
        id: user.id,
        nama: user.nama,
      },
    });

    if (!checkUser) throw new Error("Error, You're not signed");

    const data = await prisma.cartItem.deleteMany({
      where: {
        cart_id,
      },
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
}

export async function deleteSingleItem(req, res) {
  const user = req.user;
  const { itemId } = req.body;

  try {
    const checkUser = await prisma.user.findFirst({
      where: {
        id: user.id,
        nama: user.nama,
      },
    });

    if (!checkUser) throw new Error("Error, You're not signed");

    const data = await prisma.cartItem.delete({
      where: {
        cart_item_id: itemId,
      },
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
}
