import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getAllCart(req, res) {
    const user = req.user;

    try {
        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id,
                nama: user.nama
            }
        });

        if (!checkUser) throw "Error, You're Not Signed";

        let data = await prisma.cart.findFirst({
            where: {
                user_id: user.id
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
                            }
                        }
                    }
                }
            }
        });

        if (!data) {
            data = await prisma.cart.create({
                data: {
                    user_id: user.id
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
                           }
                        }
                    }
                }
            });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error });
    }
}


export async function saveCart(req, res) {
    const user = req.user;
    const { quantity, product_id, size } = req.body;

    try {
        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id,
                nama: user.nama
            }
        });

        if (!checkUser) throw "Error, You're not signed";

        let cart = await prisma.cart.findFirst({
            where: {
                user_id: user.id
            }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    user_id: user.id
                }
            });
        }

        const checkProduct = await prisma.cartItem.findFirst({
            where: {
                product_id,
                cart_id: cart.cart_id,
                size: size
            }
        });

        if (checkProduct) throw "Error, you've already put this item in your cart";

        // Dapatkan harga produk
        const productData = await prisma.product.findUnique({
            where: {
                product_id: product_id 
            }
        });

        const stockData = await prisma.stock.findFirst({
            where: {
                product_id: product_id,
                size: size
            }
        })

        if (!productData) throw "Error, product not found";
        if(!stockData) throw "Error, stock for the specified"
        if(stockData.quantity < quantity) throw "Error, insufficient stock"

        // Hitung total harga
        const total_price = quantity * productData.price;

        //kurangi quantity pada stok
        await prisma.stock.update({
            where: {
                stock_id: stockData.stock_id,
            },
            data: {
                quantity: stockData.quantity - quantity
            }
        })

        // Tambahkan item ke keranjang
        await prisma.cartItem.create({
            data: {
                quantity,
                product_id,
                cart_id: cart.cart_id,
                total_price: total_price,
                size: size
            }
        });

        res.status(200).json({ success: "Product has been stored in your cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}


export async function changeQTY(req, res) {
    const user = req.user;
    const { itemId, qty } = req.body;

    try {
        // Pastikan itemId diterima dengan benar
        if (!itemId) throw "Error, itemId is required";

        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id,
                nama: user.nama
            }
        });

        if (!checkUser) throw "Error, You're not signed";

        // Periksa apakah item keranjang ada
        const cartItem = await prisma.cartItem.findUnique({
            where: {
                cart_item_id: itemId  
            },
            include: {
                product: {
                    select: {
                        price: true
                    }
                }
            }
        });

        if (!cartItem) throw "Error, Cart item not found";

        // Hitung total harga baru
        const total_price = qty * cartItem.product.price;

        // Perbarui item keranjang dengan kuantitas baru dan total harga baru
        const data = await prisma.cartItem.update({
            where: {
                cart_item_id: itemId  
            },
            data: {
                quantity: qty,
                total_price: total_price
            }
        });

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error });
    }
}


export async function deleteAllItem(req, res) {
    const user = req.user;
    const { cart_id } = req.body;

    try {
        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id,
                nama: user.nama
            }
        });

        if (!checkUser) throw "Error, You're not signed";

        const data = await prisma.cartItem.deleteMany({
            where: {
                cart_id
            }
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error });
    }
}

export async function deleteSingleItem(req, res) {
    const user = req.user;
    const { itemId } = req.body;

    try {
        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id,
                nama: user.nama
            }
        });

        if (!checkUser) throw "Error, You're not signed";

        const data = await prisma.cartItem.delete({
            where: {
                cart_item_id: itemId
            }
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error });
    }
}
