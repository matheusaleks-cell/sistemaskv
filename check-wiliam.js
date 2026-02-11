const { Pool } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres?sslmode=no-verify";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query('SELECT name, email, password FROM "User" WHERE email = $1', ['wiliam@grafica.com']);
        if (res.rowCount === 0) {
            console.log('User not found');
        } else {
            const user = res.rows[0];
            console.log(`User: ${user.name}`);
            console.log(`Password in DB: [${user.password}]`);
            console.log(`Match with Jojo!246040: ${user.password === 'Jojo!246040'}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

check();
