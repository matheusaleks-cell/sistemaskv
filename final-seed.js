const { Pool } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres?sslmode=no-verify";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    try {
        console.log('Finalizing database users...');
        // Insert Wiliam
        await pool.query(`
            INSERT INTO "User" (id, email, name, password, role, "createdAt")
            VALUES ('1', 'wiliam@grafica.com', 'Wiliam', 'Jojo!246040', 'MASTER', NOW())
            ON CONFLICT (email) DO UPDATE SET password = 'Jojo!246040'
        `);
        // Insert Amanda
        await pool.query(`
            INSERT INTO "User" (id, email, name, password, role, "createdAt")
            VALUES ('2', 'amanda@atendimento.com', 'Amanda', 'Jojo!246040', 'ATTENDANT', NOW())
            ON CONFLICT (email) DO UPDATE SET password = 'Jojo!246040'
        `);
        console.log('Success! Users are ready.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

seed();
