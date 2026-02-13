
const { Pool } = require('pg')
require('dotenv').config()

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })
    try {
        console.log('Adding companyName to Client table...')
        await pool.query('ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "companyName" TEXT')
        console.log('Success!')
    } catch (e) {
        console.error('Failed to update table:', e.message)
    } finally {
        await pool.end()
    }
}
main()
