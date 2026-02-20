import { Pool } from 'pg';

// Shim for Prisma Client using pg directly
// This is necessary because Prisma CLI generation is failing in this environment.

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export const prisma = {
    order: {
        findMany: async (args: any) => {
            console.log('PG Shim: findMany', args);
            // Ignore args for now, just fetch recent orders
            const res = await pool.query('SELECT * FROM "Order" ORDER BY "createdAt" DESC');
            const orders = res.rows;
            for (const order of orders) {
                const itemsRes = await pool.query('SELECT * FROM "OrderItem" WHERE "orderId" = $1', [order.id]);
                order.items = itemsRes.rows;
                // Convert Decimal to Number for frontend compatibility
                order.total = Number(order.total);
                order.shippingValue = Number(order.shippingValue);
                order.items = order.items.map((i: any) => ({
                    ...i,
                    width: Number(i.width),
                    height: Number(i.height),
                    unitPrice: Number(i.unitPrice),
                    totalPrice: Number(i.totalPrice)
                }));
            }
            return orders;
        },
        create: async (args: any) => {
            console.log('PG Shim: create', JSON.stringify(args, null, 2));
            const data = args.data;
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Insert Order
                const orderRes = await client.query(`
                    INSERT INTO "Order" ("id", "clientId", "clientName", "total", "status", "hasShipping", "shippingAddress", "shippingType", "shippingValue", "needsArt", "createdAt")
                    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                    RETURNING *
                `, [data.clientId, data.clientName, data.total, data.status, data.hasShipping || false, data.shippingAddress, data.shippingType, data.shippingValue || 0, data.needsArt !== undefined ? data.needsArt : true]);
                const order = orderRes.rows[0];

                // Insert Items
                if (data.items?.create) {
                    const items = [];
                    for (const item of data.items.create) {
                        const itemRes = await client.query(`
                            INSERT INTO "OrderItem" ("id", "orderId", "productId", "productName", "width", "height", "quantity", "unitPrice", "totalPrice", "finish", "costs")
                            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                            RETURNING *
                        `, [order.id, item.productId, item.productName, item.width, item.height, item.quantity, item.unitPrice, item.totalPrice, item.finish, item.costs]);
                        items.push(itemRes.rows[0]);
                    }
                    order.items = items;
                }
                await client.query('COMMIT');
                // Serialize Decimal
                order.total = Number(order.total);
                order.shippingValue = Number(order.shippingValue);
                if (order.items) {
                    order.items = order.items.map((i: any) => ({
                        ...i,
                        width: Number(i.width),
                        height: Number(i.height),
                        unitPrice: Number(i.unitPrice),
                        totalPrice: Number(i.totalPrice)
                    }));
                }
                return order;
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        },
        update: async (args: any) => {
            console.log('PG Shim: update', args);
            const { where, data } = args;
            const sets = [];
            const values = [];
            let i = 1;
            for (const key in data) {
                if (key === 'productionStart' || key === 'finishedAt' || key === 'validUntil' || key === 'deadline') {
                    // Date handling
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

            // Serialize
            if (order) {
                order.total = Number(order.total);
                order.shippingValue = Number(order.shippingValue);
                // Items fetch logic for update return needed?
                // Shim implementation implies simplified return.
                const itemsRes = await pool.query('SELECT * FROM "OrderItem" WHERE "orderId" = $1', [order.id]);
                order.items = itemsRes.rows.map((i: any) => ({
                    ...i,
                    width: Number(i.width),
                    height: Number(i.height),
                    unitPrice: Number(i.unitPrice),
                    totalPrice: Number(i.totalPrice)
                }));
            }
            return order;
        },
        findUnique: async (args: any) => {
            console.log('PG Shim: findUnique', args);
            const res = await pool.query('SELECT * FROM "Order" WHERE id = $1', [args.where.id]);
            return res.rows[0] || null;
        }
    },
    product: {
        findUnique: async (args: any) => {
            const res = await pool.query('SELECT * FROM "Product" WHERE id = $1', [args.where.id]);
            const product = res.rows[0];
            if (product) {
                product.price = Number(product.price);
                product.minPrice = Number(product.minPrice);
            }
            return product || null;
        }
    }
};

export default prisma;
