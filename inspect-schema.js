
const { Pool } = require('pg')
require('dotenv').config()

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })
    try {
        const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name
    `)
        console.log('Database Schema:')
        res.rows.forEach(row => console.log(`${row.table_name}.${row.column_name}: ${row.data_type}`))
    } catch (e) {
        console.error('Failed to get schema:', e.message)
    } finally {
        await pool.end()
    }
}
main()
