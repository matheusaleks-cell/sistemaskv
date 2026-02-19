'use server'

import prisma from '@/lib/prisma'
import { Order, OrderStatus } from '@/types'

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
        return { success: true, orders }
    } catch (error: any) {
        console.error('Fetch orders CRITICAL error:', error.message)
        return { success: false, error: 'Erro ao buscar pedidos: ' + error.message }
    }
}

export async function createOrderAction(data: any) {
    try {
        const order = await prisma.order.create({
            data: {
                clientId: data.clientId,
                clientName: data.clientName,
                total: data.total,
                status: data.status,
                hasShipping: data.hasShipping || false,
                shippingAddress: data.shippingAddress,
                shippingType: data.shippingType,
                shippingValue: data.shippingValue,
                needsArt: data.needsArt !== undefined ? data.needsArt : true,
                items: {
                    create: data.items.map((item: any) => ({
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
            }
        })
        return { success: true, order }
    } catch (error) {
        console.error('Create order error:', error)
        return { success: false, error: 'Erro ao criar pedido' }
    }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
    try {
        const updateData: any = { status }

        if (status === 'PRODUCTION') {
            updateData.productionStart = new Date()
        } else if (status === 'COMPLETED') {
            updateData.finishedAt = new Date()
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: updateData
        })
        return { success: true, order }
    } catch (error) {
        console.error('Update order status error:', error)
        return { success: false, error: 'Erro ao atualizar status' }
    }
}
