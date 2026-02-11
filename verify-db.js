const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const users = await prisma.user.findMany()
        console.log('--- DATABASE CHECK ---')
        console.log('Users found:', users.length)
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [Password: ${u.password}]`))
        console.log('----------------------')
    } catch (e) {
        console.error('ERROR:', e.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
