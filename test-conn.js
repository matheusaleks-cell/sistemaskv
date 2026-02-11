const { Pool } = require('pg')
require('dotenv').config()

async function test() {
    const connectionString = "postgresql://postgres.pgviebosymajwqcucljd:Jojo%21246040@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    console.log('Testing connection to pooler...')
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    })
    try {
        const res = await pool.query('SELECT NOW()')
        console.log('Connection successful:', res.rows[0])
    } catch (e) {
        console.error('Connection failed:', e.message)
    } finally {
        await pool.end()
    }
}

test()
