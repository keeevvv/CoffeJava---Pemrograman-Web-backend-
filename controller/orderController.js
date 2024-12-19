
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

export async function getAllOrders(req, res) {
    const user = req.user

    try {
        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id,
                nama: user.nama
            }
        });

        if (!checkUser) throw "Error, You're Not Signed";

        let orders = await prisma.order.findMany({
            where: {
                user_id: user.id
            },
            include: {
                ordersItem: true,
                shipping: true
            }
        })

        res.status(200).json(orders)

    }catch(error) {
        console.error(error);
        res.status(400).json({ error });
    }
}

export async function getOrdersById(req, res) {
    const user = req.user
    const orderId = req.params.order_id

    // console.log('Request User:', user);  
    // console.log('Request Order ID:', orderId)

    try {
        // console.log('User:', user)

        let orders = await prisma.order.findFirst({
            where: {
                order_id: orderId,
                user_id: user.id
            },
            include: {
                ordersItem: true,
                shipping: true
            }
        })

        if(!orders) throw "Order not found"
        res.status(200).json(orders)

    }catch(error) {
        console.error(error);
        res.status(400).json({ error });
    }
}


export async function makeOrders(req, res) {
    // console.log('Request User:', req.user);
    // console.log('Request Body:', req.body);

    const user = req.user;
    const { shipping_id, ordersItem } = req.body;

    try {
        // Validate user
        if (!user || !user.sub) {
            return res.status(401).json({ error: "Authentication failed: User not found" });
        }

        // Verify user exists in database
        const existingUser = await prisma.user.findFirst({
            where: {
                id: user.id
            }
        });

        if (!existingUser) {
            return res.status(404).json({ error: "User not found in database",
                details: {
                    id: user.id,
                    nama:user.nama
                }
             });
        }

        // Verify shipping address
        const checkShipping = await prisma.shippingAddress.findFirst({
            where: { shipping_id: shipping_id }
        });

        if (!checkShipping) {
            return res.status(404).json({ error: "Shipping address not found" });
        }

        // Create order using direct ID assignment
        const newOrder = await prisma.order.create({
            data: {
                status: 'pending',
                shipping_id: shipping_id,
                user_id: existingUser.id,
                ordersItem: {
                    create: ordersItem.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        total_price: item.total_price
                    }))
                }
            }
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Order Creation Error:', error);
        res.status(500).json({ 
            error: error.message || "Internal server error",
            details: error
        });
    }
}


export async function makeShippingAddress(req, res) {
    const user = req.user;
    const { address, city, country, postal, courier, cost } = req.body;

    try {
        // Tambahkan log untuk debug
        // console.log('Received user:', user);

        if (!user) throw "Error, user not authenticated";

        // Cari user berdasarkan userId atau email dari JWT token
        let checkUser = await prisma.user.findFirst({
            where: {
                id: user.id
            }
        });

        if (!checkUser) {
            console.log('User not found with email:', user.email);
            throw "Error, user not found";
        }

        // Membuat alamat pengiriman baru
        const shippingAddress = await prisma.shippingAddress.create({
            data: {
                address: address,
                city: city,
                country: country,
                postal: postal,
                courier: courier,
                cost: cost,
                user_id: checkUser.id 
            }
        });

        res.status(201).json({ success: "Shipping address created", shippingAddress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}

export async function getShippingAddress(req, res){
    const user = req.user;

    try{
        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id
            }
        });
        if (!checkUser) throw "Error, You're Not Signed";

        const shippingAddress = await prisma.shippingAddress.findMany({
            where: {
                user_id:user.id
            }
        });

        res.status(200).json(shippingAddress);
    } catch (error){
        console.error(error);
        res.status(500).json({error: "internal server error"});
    }
}


export async function getShippingAddressById(req, res){
    const user = req.user; 
    const { id } = req.params; 

    try {
        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id,
            },
        });
        if (!checkUser) throw "Error you're not signed in";

        const shippingAddress = await prisma.shippingAddress.findFirst({
            where: {
                user_id: user.id, 
                shipping_id: parseInt(id), 
            },
        });

        if (!shippingAddress) {
            return res.status(404).json({ error: "Shipping address not found" });
        }

        res.status(200).json(shippingAddress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }

}



export async function updateStatus(req, res) {
    const user = req.user
    const {orderId} = req.params
    const {status} = req.body

    try{
        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id,
                nama: user.nama
            }
        })

        if(!checkUser) throw "Error, You're Not Signed"

        const order = await prisma.order.findFirst({
            where: {
                order_id: orderId,
                user_id: user.id
            }
        })

        if(!order) throw "Order Not Found"

        const updateOrder = await prisma.order.update({
            where: {
                order_id: order.order_id,
            },
            data: {
                status
            }
        })

        res.status(200).json(updateOrder)

    }catch(error) {
        console.error(error)
        res.status(400).json({error})
    }
}