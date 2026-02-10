import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
    // Determine which connection string to use
    // On Netlify/Production, we MUST use DATABASE_URL (Transaction Pooler port 6543)
    // We append ?pgbouncer=true to the URL in .env
    const connectionString = process.env.DATABASE_URL || ''
    console.log('Initializing Prisma with DATABASE_URL (pgbouncer mode), length:', connectionString?.length);

    // For PgBouncer in Transaction Mode (port 6543), we are using the default Prisma Query Engine.
    // The pg-adapter (driver adapter) sends prepared statements by default which PgBouncer transaction mode DOES NOT support.

    return new PrismaClient({
        // @ts-ignore - datasources IS valid but types might be acting up
        datasources: {
            db: {
                url: connectionString
            }
        }
    })
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
