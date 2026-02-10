const { Pool } = require('pg')
require('dotenv').config()

async function test() {
    const connectionString = process.env.DATABASE_URL
    console.log('Testing connection to pooler...')
    const pool = new Pool({ connectionString })
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
