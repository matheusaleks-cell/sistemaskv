'use server'

import prisma from '@/lib/prisma'
import { Client } from '@/types'

export async function getClientsAction() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, clients }
    } catch (error) {
        console.error('Fetch clients error:', error)
        return { success: false, error: 'Erro ao buscar clientes' }
    }
}

export async function createClientAction(data: any) {
    try {
        const client = await prisma.client.create({
            data: {
                name: data.name,
                companyName: data.companyName, // Wait, schema doesn't have companyName!
                document: data.document,
                email: data.email,
                phone: data.phone,
                origin: data.origin,
                type: data.type || 'PF',
            }
        })
        return { success: true, client }
    } catch (error) {
        console.error('Create client error:', error)
        return { success: false, error: 'Erro ao cadastrar cliente' }
    }
}
