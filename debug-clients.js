
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv').config()

async function main() {
    const connectionString = process.env.DATABASE_URL
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    try {
        const clients = await prisma.client.findMany()
        console.log('Total clients in DB:', clients.length)
        console.log('Clients:', JSON.stringify(clients, null, 2))

        // Test creating a temporary client
        console.log('Attempting to create a test client...')
        const newClient = await prisma.client.create({
            data: {
                name: "Teste Conexao",
                phone: "11999999999",
                type: "PF"
            }
        })
        console.log('Client created:', newClient.id)

        // Cleanup
        await prisma.client.delete({ where: { id: newClient.id } })
        console.log('Test client deleted.')

    } catch (e) {
        console.error('Operation failed:', e.message)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

main()
