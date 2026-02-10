const { PrismaClient } = require('@prisma/client')

async function check() {
    const prisma = new PrismaClient()
    try {
        const users = await prisma.user.findMany()
        console.log('--- USERS IN DB ---')
        users.forEach(u => {
            console.log(`Email: ${u.email}, Role: ${u.role}, Password: ${u.password}`)
        })
        console.log('-------------------')
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

check()
