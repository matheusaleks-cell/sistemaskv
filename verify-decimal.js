const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres"
});

async function main() {
    await client.connect();
    console.log('Connected.');

    try {
        console.log('Testing Decimal precision on "Order" table...');
        const testId = 'test-decimal-' + Date.now();
        const testClientId = 'test-client-' + Date.now();
        const testTotal = 123.45; // Exact 2 decimals

        // Insert Client
        await client.query(`
            INSERT INTO "Client" ("id", "name", "email")
            VALUES ($1, 'Test Client For Calc', 'test@test.com')
        `, [testClientId]);

        // Insert Order
        await client.query(`
            INSERT INTO "Order" ("id", "clientId", "clientName", "total", "status", "createdAt")
            VALUES ($1, $2, 'Test Client For Calc', $3, 'QUOTE', NOW())
        `, [testId, testClientId, testTotal]);

        // Retrieve
        const res = await client.query('SELECT total FROM "Order" WHERE id = $1', [testId]);
        const fetchedTotal = res.rows[0].total;

        console.log(`Inserted: ${testTotal}`);
        console.log(`Fetched (raw):`, fetchedTotal, `Type: ${typeof fetchedTotal}`);

        if (fetchedTotal === '123.45') {
            console.log('SUCCESS: Fetched value matches string "123.45". Decimal precision preserved.');
        } else {
            console.log('WARNING: Value mismatch or type difference.');
        }

        // Verify Products
        console.log('Verifying Products...');
        const productsRes = await client.query('SELECT * FROM "Product"');
        console.log(`Found ${productsRes.rows.length} products.`);
        productsRes.rows.forEach(p => console.log(`- ${p.name}: ${p.price}`));

        // Cleanup
        await client.query('DELETE FROM "Order" WHERE id = $1', [testId]);
        await client.query('DELETE FROM "Client" WHERE id = $1', [testClientId]);
        console.log('Cleanup done.');

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
