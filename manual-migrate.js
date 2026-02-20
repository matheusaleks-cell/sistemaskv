const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres" // Hardcoded for reliability
});

async function main() {
    await client.connect();
    console.log('Connected to database.');

    try {
        // 1. Alter Order table
        console.log('Altering Order table...');
        await client.query('ALTER TABLE "Order" ALTER COLUMN "total" TYPE DECIMAL(10,2);');
        await client.query('ALTER TABLE "Order" ALTER COLUMN "shippingValue" TYPE DECIMAL(10,2);');

        // 2. Alter OrderItem table
        console.log('Altering OrderItem table...');
        await client.query('ALTER TABLE "OrderItem" ALTER COLUMN "unitPrice" TYPE DECIMAL(10,2);');
        await client.query('ALTER TABLE "OrderItem" ALTER COLUMN "totalPrice" TYPE DECIMAL(10,2);');
        await client.query('ALTER TABLE "OrderItem" ALTER COLUMN "width" TYPE DECIMAL(10,2);');
        await client.query('ALTER TABLE "OrderItem" ALTER COLUMN "height" TYPE DECIMAL(10,2);');

        // 3. Alter FinancialRecord table
        console.log('Altering FinancialRecord table...');
        await client.query('ALTER TABLE "FinancialRecord" ALTER COLUMN "amount" TYPE DECIMAL(10,2);');

        // 4. Create Product table
        console.log('Creating Product table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Product" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "price" DECIMAL(10,2) NOT NULL,
                "minPrice" DECIMAL(10,2) DEFAULT 0,
                "pricingType" TEXT NOT NULL DEFAULT 'AREA',
                "category" TEXT NOT NULL DEFAULT 'OTHER',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,

                CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
            );
        `);

        // 5. Seed Products
        console.log('Seeding products...');
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

        for (const p of products) {
            const res = await client.query('SELECT id FROM "Product" WHERE name = $1', [p.name]);
            if (res.rows.length === 0) {
                await client.query(`
                    INSERT INTO "Product" (id, name, price, "minPrice", "pricingType", category, "createdAt", "updatedAt")
                    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                `, [
                    require('crypto').randomUUID(),
                    p.name,
                    p.price,
                    p.minPrice,
                    p.pricingType,
                    p.category
                ]);
                console.log(`Created product: ${p.name}`);
            } else {
                console.log(`Product exists: ${p.name}`);
                // Update
                await client.query(`
                    UPDATE "Product" SET price = $1, "minPrice" = $2, "pricingType" = $3, category = $4, "updatedAt" = NOW()
                    WHERE name = $5
                `, [
                    p.price,
                    p.minPrice,
                    p.pricingType,
                    p.category,
                    p.name
                ]);
            }
        }

        console.log('Migration and Seeding completed successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

main();
