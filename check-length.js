const { Pool } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres?sslmode=no-verify";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query('SELECT password, LENGTH(password) as len FROM "User" WHERE email = $1', ['wiliam@grafica.com']);
        const user = res.rows[0];
        console.log(`Password: [${user.password}]`);
        console.log(`Length: ${user.len}`);
        console.log(`Expected Length for "Jojo!246040": ${"Jojo!246040".length}`);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

check();
