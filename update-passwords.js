const { Pool } = require('pg');
require('dotenv').config();

// Use the connection string with the password already encoded or handle it here
const connectionString = "postgresql://postgres:Jojo%21246040@db.pgviebosymajwqcucljd.supabase.co:5432/postgres?sslmode=no-verify";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function updatePasswords() {
    try {
        console.log('Updating user passwords to Jojo!246040...');
        await pool.query(`
            UPDATE "User" 
            SET password = 'Jojo!246040'
            WHERE email IN ('wiliam@grafica.com', 'amanda@atendimento.com')
        `);
        console.log('Passwords updated successfully!');
    } catch (e) {
        console.error('Error updating passwords:', e.message);
    } finally {
        await pool.end();
    }
}

updatePasswords();
