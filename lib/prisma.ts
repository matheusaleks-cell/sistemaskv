import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
    // Use DIRECT_URL with limited connections for serverless
    const connectionString = process.env.DIRECT_URL
    console.log('Initializing Prisma with DIRECT_URL for serverless, length:', connectionString?.length);

    const pool = new pg.Pool({
        connectionString,
        max: 1, // Limit connections for serverless
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
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
