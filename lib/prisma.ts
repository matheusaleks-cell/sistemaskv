import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
    // Use Session Pooler (port 5432) for IPv4 compatibility and Direct mode behavior
    const connectionString = process.env.DATABASE_URL
    console.log('Initializing Prisma with Session Pooler, length:', connectionString?.length);

    const pool = new pg.Pool({
        connectionString,
        max: 10, // Reasonable limit for session pooler
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 5000,
    })

    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
