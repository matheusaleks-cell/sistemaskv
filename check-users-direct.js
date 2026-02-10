const { Pool } = require('pg')
require('dotenv').config()

async function check() {
    const connectionString = process.env.DIRECT_URL
    const pool = new Pool({ connectionString })
    try {
        const res = await pool.query('SELECT * FROM "User"')
        console.log('--- USERS IN DB ---')
        res.rows.forEach(u => {
            console.log(`Email: ${u.email}, Password: ${u.password}`)
        })
        console.log('-------------------')
    } catch (e) {
        console.error(e.message)
    } finally {
        await pool.end()
    }
}

check()
