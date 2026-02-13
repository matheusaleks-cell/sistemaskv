
const { Pool } = require('pg')
require('dotenv').config()

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })
    try {
        console.log('Adding missing columns to Order table...')
        await pool.query('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "hasShipping" BOOLEAN DEFAULT FALSE')
        await pool.query('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT')
        await pool.query('ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingValue" DOUBLE PRECISION DEFAULT 0')
        console.log('Success!')
    } catch (e) {
        console.error('Failed to update table:', e.message)
    } finally {
        await pool.end()
    }
}
main()
