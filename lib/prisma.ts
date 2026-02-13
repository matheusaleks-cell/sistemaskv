import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL

    if (connectionString) {
        const host = connectionString.split('@')[1]?.split('/')[0] || 'unknown';
        console.log(`[Prisma] Inicializando conexão com host: ${host.replace(/.*(?=\.)/, '***')}`);
    } else {
        console.error('[Prisma] DATABASE_URL não encontrada no ambiente!');
    }

    const pool = new Pool({
        connectionString,
        ssl: connectionString?.includes('supabase') ? { rejectUnauthorized: false } : false
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
