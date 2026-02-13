
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
        const users = await prisma.user.findMany()
        console.log('Users in DB:', JSON.stringify(users, null, 2))

        const clients = await prisma.client.findMany()
        console.log('Clients in DB:', JSON.stringify(clients, null, 2))

    } catch (e) {
        console.error('Operation failed:', e.message)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

main()
