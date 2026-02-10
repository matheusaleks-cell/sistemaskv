import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Prisma 7 requires explicit connection string configuration since schema won't have it
    const connectionString = process.env.DATABASE_URL
    return new PrismaClient({
        // @ts-ignore - 'datasources' is valid for overriding connection string
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
