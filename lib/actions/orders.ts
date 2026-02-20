'use server'

import prisma from '@/lib/prisma'
import { Order, OrderStatus, Product } from '@/types'

const serializeOrder = (order: any) => ({
    ...order,
    total: Number(order.total),
    shippingValue: order.shippingValue ? Number(order.shippingValue) : 0,
    items: order.items.map((item: any) => ({
        ...item,
        width: Number(item.width),
        height: Number(item.height),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
    }))
});

export async function getOrdersAction() {
    console.log('--- GET ORDERS ACTION ---');
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true
            },
            orderBy: { createdAt: 'desc' }
        })
        console.log(`Success: Found ${orders.length} orders`);
        const serializedOrders = orders.map(serializeOrder);
        return { success: true, orders: serializedOrders }
    } catch (error: any) {
        console.error('Fetch orders CRITICAL error:', error.message)
        return { success: false, error: 'Erro ao buscar pedidos: ' + error.message }
    }
}

// Helper to calculate item price (Centralized Logic)
async function calculateItemPrice(item: any) {
    if (!item.productId) return { unitPrice: Number(item.unitPrice), totalPrice: Number(item.totalPrice) }; // Fallback for custom items without product ID

    const product = await prisma.product.findUnique({
        where: { id: item.productId }
    });

    if (!product) return { unitPrice: Number(item.unitPrice), totalPrice: Number(item.totalPrice) }; // Fallback if product not found

    let unitPrice = 0;
    let totalPrice = 0;
    const q = item.quantity > 0 ? item.quantity : 1;
    const w = Number(item.width);
    const h = Number(item.height);

    if (product.pricingType === 'FIXED') {
        unitPrice = Number(product.price);
        totalPrice = unitPrice * q;
    } else {
        // Area based (assuming width/height in cm, price per m2)
        // Formula: (width * height / 10000) * price
        const areaM2 = (w * h) / 10000;
        unitPrice = areaM2 * Number(product.price);
        // Minimum price check per unit effective calculation
        // Usually minPrice is per item instance or per total? 
        // Based on audit: "Minimum Price Rule: The current implementation applies the minimum price to the item total"
        // Let's stick to current logic: Calculate strict area price first.
        totalPrice = unitPrice * q;
    }

    // Apply Minimum Price Rule
    // If logic is: Total Price of the line item cannot be less than MinPrice? 
    // Or Unit Price cannot be less than MinPrice?
    // Audit said: "applies the minimum price to the item total"
    if (product.minPrice && totalPrice < Number(product.minPrice)) {
        totalPrice = Number(product.minPrice);
        // Recalculate unit price for consistency
        unitPrice = totalPrice / q;
    }

    return {
        unitPrice: Number(unitPrice.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2))
    };
}

export async function createOrderAction(data: any) {
    try {
        // 1. Validate and Recalculate Items
        let calculatedTotal = 0;
        const processedItems = [];

        for (const item of data.items) {
            // Validate quantity
            if (item.quantity <= 0) throw new Error(`Invalid quantity for item ${item.productName}`);

            // Calculate secure price
            const { unitPrice, totalPrice } = await calculateItemPrice(item);

            processedItems.push({
                ...item,
                unitPrice,
                totalPrice,
                width: Number(item.width),
                height: Number(item.height),
                quantity: Number(item.quantity)
            });

            calculatedTotal += totalPrice;
        }

        // 2. Recalculate Order Total
        // Add shipping if applicable
        const shipping = data.hasShipping && data.shippingValue ? Number(data.shippingValue) : 0;
        const finalTotal = calculatedTotal + shipping;

        // 3. Create Order with SECURE data
        const order = await prisma.order.create({
            data: {
                clientId: data.clientId,
                clientName: data.clientName,
                total: Number(finalTotal.toFixed(2)), // SECURE TOTAL
                status: data.status,
                hasShipping: data.hasShipping || false,
                shippingAddress: data.shippingAddress,
                shippingType: data.shippingType,
                shippingValue: Number(shipping.toFixed(2)),
                needsArt: data.needsArt !== undefined ? data.needsArt : true,
                items: {
                    create: processedItems.map((item: any) => ({
                        productId: item.productId,
                        productName: item.productName,
                        width: item.width,
                        height: item.height,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        finish: item.finish,
                        costs: item.costs
                    }))
                }
            },
            include: { items: true }
        })
        return { success: true, order: serializeOrder(order) }
    } catch (error: any) {
        console.error('Create order error:', error)
        return { success: false, error: 'Erro ao criar pedido: ' + error.message }
    }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
    try {
        // 1. Fetch current status to validate transition
        const currentOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!currentOrder) {
            return { success: false, error: 'Pedido não encontrado' };
        }

        // 2. Define allowed transitions (Simple State Machine)
        const currentStatus = currentOrder.status as OrderStatus;

        // Rules:
        // - Cannot go back from COMPLETED or DELIVERED to QUOTE, ART, APPROVED, PRODUCTION
        // - DELIVERED is terminal (mostly)

        const isFinished = currentStatus === 'COMPLETED' || currentStatus === 'DELIVERED';
        const isTryingToGoBack = ['QUOTE', 'ART', 'APPROVED', 'PRODUCTION'].includes(status);

        if (isFinished && isTryingToGoBack) {
            return {
                success: false,
                error: `Não é permitido alterar status de ${currentStatus} para ${status}. O pedido já foi finalizado.`
            };
        }

        const updateData: any = { status }

        if (status === 'PRODUCTION') {
            updateData.productionStart = new Date()
        } else if (status === 'COMPLETED') {
            updateData.finishedAt = new Date()
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: { items: true }
        })
        return { success: true, order: serializeOrder(order) }
    } catch (error: any) {
        console.error('Update order status error:', error)
        return { success: false, error: 'Erro ao atualizar status: ' + error.message }
    }
}
