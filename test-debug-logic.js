
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function test() {
    const url = process.env.DATABASE_URL;
    console.log('Testing with URL:', url);
    try {
        const client = new PrismaClient({
            datasources: { db: { url } }
        });
        console.log('Client created successfully');
        await client.$connect();
        console.log('Connected');
        await client.$disconnect();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
