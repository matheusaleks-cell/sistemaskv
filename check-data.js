
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function check() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Using URL:', connectionString);
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const clients = await prisma.client.findMany();
        console.log(`Found ${clients.length} clients`);
        clients.forEach(c => {
            console.log(`ID: ${c.id}, Name: ${c.name}, CreatedAt: ${c.createdAt}`);
        });

        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users`);
        users.forEach(u => {
            console.log(`ID: ${u.id}, Name: ${u.name}`);
        });

    } catch (e) {
        console.error('Error during check:', e.message);
    } finally {
        await pool.end();
    }
}

check();
