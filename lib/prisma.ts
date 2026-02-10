import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // A configuração de conexão será lida automaticamente do process.env.DATABASE_URL
    // e do process.env.DIRECT_URL. Não precisamos sobrescrever aqui.
    return new PrismaClient()
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
