import { PrismaClient } from "@prisma/client";
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

        if (!checkUser) throw new Error("Error, You're Not Signed");

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

        if(!orders) throw new Error("Order not found")
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
       

        if (!user) throw new Error("Error, user not authenticated");

        
        let checkUser = await prisma.user.findFirst({
            where: {
                id: user.id
            }
        });

        if (!checkUser) {
            console.log('User not found with email:', user.email);
            throw new Error("Error, user not found");
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

        res.status(201).json({
            success: true,
            message: "Shipping address created successfully",
            data: shippingAddress
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
}



export async function updateStatus(req, res) {
    const user = req.user
    // const {orderId} = req.params
    const {status} = req.body

    try{
        const checkUser = await prisma.user.findFirst({
            where: {
                id: user.id,
                nama: user.nama
            }
        })

        if(!checkUser) throw new Error("Error, You're Not Signed")


        const updateOrder = await prisma.order.updateMany({
            where: {
                user_id:user.id
            },
            data: {
                status: status
            }
        })

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            status: req.body.status,
            data: updateOrder
        });

    }catch(error) {
        console.error(error)
        res.status(400).json({error})
    }
}