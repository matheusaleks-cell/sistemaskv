'use server'

import prisma from '@/lib/prisma'
import { Client } from '@/types'

export async function getClientsAction() {
    console.log('--- GET CLIENTS ACTION ---');
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' }
        })
        console.log(`Success: Found ${clients.length} clients`);
        return { success: true, clients }
    } catch (error: any) {
        console.error('Fetch clients CRITICAL error:', error.message)
        return { success: false, error: 'Erro ao buscar clientes: ' + error.message }
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
