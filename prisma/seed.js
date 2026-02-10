const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv').config()

async function main() {
    const connectionString = process.env.DIRECT_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    const users = [
        {
            name: 'Wiliam',
            email: 'wiliam@grafica.com',
            role: 'MASTER',
            password: 'Jojo!246040'
        },
        {
            name: 'Amanda',
            email: 'amanda@atendimento.com',
            role: 'ATTENDANT',
            password: 'Jojo!246040'
        }
    ]

    console.log('Seeding users into Supabase...')
    for (const user of users) {
        const upserted = await prisma.user.upsert({
            where: { email: user.email },
            update: { password: user.password },
            create: user,
        })
        console.log(`- ${upserted.name} (${upserted.email})`)
    }

    await prisma.$disconnect()
    await pool.end()
}

main().catch(console.error)
