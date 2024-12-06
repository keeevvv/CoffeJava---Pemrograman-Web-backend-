import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import midtransClient from "midtrans-client";

export async function processTransaction(req, res) {
    const user = req.user;
    const { shipping_id, payment_type } = req.body;

    try {
        let snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.SERVER_KEY,
            clientKey: process.env.CLIENT_KEY
        });

        const existingUser = await prisma.user.findFirst({
            where: {
                id: user.id
            }
        });

        if (!existingUser) {
            return res.status(404).json({
                error: "User not found in database",
                details: {
                    id: user.id,
                    nama: user.nama
                }
             });
        }

        const cart = await prisma.cart.findFirst({
            where: {
                user_id: user.id
            },
            include: {
                cart_items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart) {
            console.log('No cart found for user:', user.id);
            return res.status(404).json({
                error: 'Cart not found',
                message: `No cart exists for user ID ${user.id}`
            });
        }

        const item_details = cart.cart_items.map(item => ({
            id: item.cart_item_id,
            price: item.product.price,
            quantity: item.quantity,
            name: item.product.pName,
            size: item.size
        }));

        
        const newOrder = await prisma.order.create({
            data: {
                status: 'paid',
                user: {
                    connect: { id: existingUser.id }
                },
                shipping: {
                    connect: { shipping_id: shipping_id }
                },
                ordersItem: {
                    create: cart.cart_items.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        total_price: item.quantity * item.product.price,
                        size: item.size
                    }))
                }
            }
        });

        
        const order_id = newOrder.order_id;

        const gross_amount = item_details.reduce((total, item) => total + (item.price * item.quantity), 0);

        const parameter = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": gross_amount
            },
            "item_details": item_details,
            "customer_details": {
                "first_name": user.nama,
                "email": user.email
            },
            "credit_card": {
                "secure": true
            },
            "enabled_payments": [payment_type]
        };

        const transaction = await snap.createTransaction(parameter);

        res.status(200).json({ transaction, newOrder });
    } catch (error) {
        console.error('Error in processTransaction:', error);
        res.status(400).json({ error: error.message });
    }
}



export async function paymentSuccess(req, res) {
    const { transaction } = req.body;

    try {

        if (!transaction) {
            return res.status(400).json({
                error: "Invalid payload: Missing transaction",
                receivedPayload: req.body
            });
        }

        const order_id = transaction.orderId; 

        console.log('Received Order ID:', order_id);

        if (!order_id) {
            return res.status(400).json({
                error: "Invalid transaction: Missing order_id",
                receivedTransaction: transaction
            });
        }

        if (transaction.fraud_status !== "accept" || transaction.transaction_status !== "settlement") {
            return res.status(400).json({ error: "Transaction not approved" });
        }

        const updatedOrder = await prisma.order.update({
            where: {
                order_id: order_id, 
            },
            data: {
                status: 'paid'
            }
        });

        res.status(200).json({ success: "Payment Success!", updatedOrder });
    } catch (error) {
        console.error('Payment Success Error:', error);
        res.status(500).json({ error: error.toString() });
    }
}
