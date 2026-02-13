
const { Pool } = require('pg')
require('dotenv').config()

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })
    try {
        const tables = ['Order', 'OrderItem', 'FinancialRecord'];
        for (const table of tables) {
            const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`)
            console.log(`Table ${table} columns:`, res.rows.map(r => r.column_name).join(', '))
        }
    } catch (e) {
        console.error('Failed:', e.message)
    } finally {
        await pool.end()
    }
}
main()
