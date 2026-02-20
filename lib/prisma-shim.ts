import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase sometimes
});

// Mock Prisma Client Interface
export const prisma = {
    order: {
        findMany: async (args: any) => {
            // Basic implementation details for findMany
            console.log('PG Shim: findMany', args);
            const res = await pool.query('SELECT * FROM "Order" ORDER BY "createdAt" DESC');
            const orders = res.rows;
            // Fetch items for each order? This is N+1 but acceptable for small scale or we use JOIN.
            // Using JOIN is better.
            // But to keep it simple and match Prisma structure:
            for (const order of orders) {
                const itemsRes = await pool.query('SELECT * FROM "OrderItem" WHERE "orderId" = $1', [order.id]);
                order.items = itemsRes.rows;
            }
            return orders;
        },
        create: async (args: any) => {
            console.log('PG Shim: create', args);
            const data = args.data;
            // Insert Order
            const orderRes = await pool.query(`
                INSERT INTO "Order" ("id", "clientId", "clientName", "total", "status", "hasShipping", "shippingAddress", "shippingType", "shippingValue", "needsArt", "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
                RETURNING *
            `, [data.clientId, data.clientName, data.total, data.status, data.hasShipping, data.shippingAddress, data.shippingType, data.shippingValue, data.needsArt]);
            const order = orderRes.rows[0];

            // Insert Items
            if (data.items?.create) {
                const items = [];
                for (const item of data.items.create) {
                    const itemRes = await pool.query(`
                        INSERT INTO "OrderItem" ("id", "orderId", "productId", "productName", "width", "height", "quantity", "unitPrice", "totalPrice", "finish", "costs")
                        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        RETURNING *
                    `, [order.id, item.productId, item.productName, item.width, item.height, item.quantity, item.unitPrice, item.totalPrice, item.finish, item.costs]);
                    items.push(itemRes.rows[0]);
                }
                order.items = items;
            }
            return order;
        },
        update: async (args: any) => {
            console.log('PG Shim: update', args);
            // Implement update logic
            const { where, data } = args;
            const sets = [];
            const values = [];
            let i = 1;
            for (const key in data) {
                if (key === 'productionStart' && data[key] instanceof Date) {
                    sets.push(`"${key}" = $${i}`);
                    values.push(data[key]);
                } else if (key === 'finishedAt' && data[key] instanceof Date) {
                    sets.push(`"${key}" = $${i}`);
                    values.push(data[key]);
                } else {
                    sets.push(`"${key}" = $${i}`);
                    values.push(data[key]);
                }
                i++;
            }
            values.push(where.id);
            const res = await pool.query(`UPDATE "Order" SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, values);
            const order = res.rows[0];
            // Fetch items
            const itemsRes = await pool.query('SELECT * FROM "OrderItem" WHERE "orderId" = $1', [order.id]);
            order.items = itemsRes.rows;
            return order;
        },
        findUnique: async () => null // Placeholder
    },
    product: {
        findUnique: async (args: any) => {
            const res = await pool.query('SELECT * FROM "Product" WHERE id = $1', [args.where.id]);
            return res.rows[0] || null;
        }
    }
};

export default prisma;
