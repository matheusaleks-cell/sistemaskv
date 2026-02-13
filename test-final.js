
const { Pool } = require('pg')
require('dotenv').config()

async function test() {
    const connectionString = process.env.DATABASE_URL
    console.log('Testing:', connectionString.split('@')[1]) // Log host part
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    })
    try {
        const res = await pool.query('SELECT NOW()')
        console.log('Success!', res.rows[0])
    } catch (e) {
        console.error('Failed:', e.message)
    } finally {
        await pool.end()
    }
}
test()
