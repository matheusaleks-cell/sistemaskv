const { Pool } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres?sslmode=no-verify";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function debugUsers() {
    try {
        console.log('--- DEBUGGING USERS IN DB ---');
        const res = await pool.query('SELECT email, name, password FROM "User"');
        console.log('Total users:', res.rowCount);
        res.rows.forEach(user => {
            console.log(`Email: [${user.email}]`);
            console.log(`Name: [${user.name}]`);
            console.log(`Password: [${user.password}]`);
            console.log('---');
        });
    } catch (e) {
        console.error('Error debugging users:', e.message);
    } finally {
        await pool.end();
    }
}

debugUsers();
