import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = [
        {
            name: 'Wiliam',
            email: 'wiliam@grafica.com',
            role: 'MASTER',
            password: '12345'
        },
        {
            name: 'Amanda',
            email: 'amanda@atendimento.com',
            role: 'ATTENDANT',
            password: '12345'
        }
    ]

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        })
    }

    console.log('Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
