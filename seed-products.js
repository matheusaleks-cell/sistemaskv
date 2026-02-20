const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
    {
        name: 'Lona Frontlight',
        price: 80.00,
        defaultDays: 2,
        category: 'BANNER',
        pricingType: 'AREA',
        minPrice: 35.00
    },
    {
        name: 'Adesivo Vinil',
        price: 120.00,
        defaultDays: 1,
        category: 'STICKER',
        pricingType: 'AREA',
        minPrice: 35.00
    },
    {
        name: 'Caneca Personalizada',
        price: 35.00,
        defaultDays: 1,
        category: 'GIFTS',
        pricingType: 'FIXED',
        minPrice: 0.00
    }
];

async function main() {
    console.log('Seeding products...');
    for (const p of products) {
        const existing = await prisma.product.findFirst({
            where: { name: p.name }
        });

        if (!existing) {
            await prisma.product.create({
                data: p
            });
            console.log(`Created product: ${p.name}`);
        } else {
            console.log(`Product already exists: ${p.name}`);
            // Update prices just in case
            await prisma.product.update({
                where: { id: existing.id },
                data: {
                    price: p.price,
                    minPrice: p.minPrice,
                    pricingType: p.pricingType,
                    category: p.category,
                    defaultDays: p.defaultDays
                }
            });
            console.log(`Updated product: ${p.name}`);
        }
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
