const { PrismaClient } = require('@prisma/client')

async function testProd() {
    console.log('Testing Production URL from local machine...')

    // A URL exata que está no Netlify
    const url = "postgresql://postgres.ptjvgmgivptnxmmsupot:Jojo%21246040@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

    console.log('Connecting to:', url)

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    })

    try {
        const count = await prisma.user.count()
        console.log('✅ SUCESSO! Conexão estabelecida. Usuários:', count)
    } catch (e) {
        console.error('❌ FALHA:', e.message)
        console.error('Code:', e.code)
    } finally {
        await prisma.$disconnect()
    }
}

testProd()
