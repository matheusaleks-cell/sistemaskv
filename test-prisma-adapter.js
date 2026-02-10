const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv').config()

async function test() {
    const connectionString = process.env.DIRECT_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    try {
        const users = await prisma.user.findMany()
        console.log('Successfully connected and found users:', users.length)
    } catch (e) {
        console.error('Failed to connect via Prisma adapter:', e.message)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

test()
