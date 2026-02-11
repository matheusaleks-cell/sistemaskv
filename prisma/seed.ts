import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = [
        {
            name: 'Wiliam',
            email: 'wiliam@grafica.com',
            role: 'MASTER',
            password: 'Jojo!246040'
        },
        {
            name: 'Amanda',
            email: 'amanda@atendimento.com',
            role: 'ATTENDANT',
            password: 'Jojo!246040'
        }
    ]

    console.log('Seeding users...')
    for (const user of users) {
        const upserted = await prisma.user.upsert({
            where: { email: user.email },
            update: { password: user.password },
            create: user,
        })
        console.log(`- ${upserted.name} (${upserted.email})`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
