const { Pool } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres?sslmode=no-verify";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    try {
        console.log('Inserting users...');
        // Insert Wiliam
        await pool.query(`
            INSERT INTO "User" (id, email, name, password, role, "createdAt")
            VALUES ('1', 'wiliam@grafica.com', 'Wiliam', '12345', 'MASTER', NOW())
            ON CONFLICT (email) DO UPDATE SET password = '12345'
        `);
        // Insert Amanda
        await pool.query(`
            INSERT INTO "User" (id, email, name, password, role, "createdAt")
            VALUES ('2', 'amanda@atendimento.com', 'Amanda', '12345', 'ATTENDANT', NOW())
            ON CONFLICT (email) DO UPDATE SET password = '12345'
        `);
        console.log('Users inserted successfully!');
    } catch (e) {
        console.error('Error seeding:', e.message);
    } finally {
        await pool.end();
    }
}

seed();
