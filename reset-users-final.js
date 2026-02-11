const { Pool } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres?sslmode=no-verify";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function updateUsers() {
    try {
        console.log('Updating users to Wiliam and Matheus...');

        // Delete old users to start fresh with requested ones
        await pool.query('DELETE FROM "User"');

        // Insert Wiliam
        await pool.query(`
            INSERT INTO "User" (id, email, name, password, role, "createdAt")
            VALUES ('1', 'wiliam@grafica.com', 'Wiliam', '12345', 'MASTER', NOW())
        `);

        // Insert Matheus
        await pool.query(`
            INSERT INTO "User" (id, email, name, password, role, "createdAt")
            VALUES ('2', 'matheus@suporte.com', 'Matheus', '211198', 'MASTER', NOW())
        `);

        console.log('Users updated successfully!');
    } catch (e) {
        console.error('Error updating users:', e.message);
    } finally {
        await pool.end();
    }
}

updateUsers();
