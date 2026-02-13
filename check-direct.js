
const { Pool } = require('pg');
require('dotenv').config();

async function check() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Testing connection to:', connectionString);
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const resClients = await pool.query('SELECT count(*) FROM "Client"');
        console.log('Total Clients:', resClients.rows[0].count);

        const resUsers = await pool.query('SELECT count(*) FROM "User"');
        console.log('Total Users:', resUsers.rows[0].count);

        if (resClients.rows[0].count > 0) {
            const clients = await pool.query('SELECT name, "companyName" FROM "Client" LIMIT 5');
            console.log('Recent Clients:', clients.rows);
        }
    } catch (e) {
        console.error('Database error:', e.message);
    } finally {
        await pool.end();
    }
}

check();
