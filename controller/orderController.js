
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


    try {

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
