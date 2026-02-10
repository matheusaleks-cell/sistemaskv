const { Pool } = require('pg')
require('dotenv').config()

async function testPooler() {
    console.log('Testing DATABASE_URL (pooler)...')
    const connectionString = process.env.DATABASE_URL
    console.log('Connection string:', connectionString?.substring(0, 50) + '...')

    const pool = new Pool({ connectionString })

    try {
        const res = await pool.query('SELECT NOW(), current_user, current_database()')
        console.log('✅ Connection successful!')
        console.log('Time:', res.rows[0].now)
        console.log('User:', res.rows[0].current_user)
        console.log('Database:', res.rows[0].current_database)

        const users = await pool.query('SELECT email, role FROM "User"')
        console.log('\n📋 Users in database:', users.rows)
    } catch (e) {
        console.error('❌ Connection failed:', e.message)
        console.error('Error code:', e.code)
    } finally {
        await pool.end()
    }
}

testPooler()
