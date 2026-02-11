const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function test(email, password) {
    console.log('--- TESTING AUTH LOGIC ---');
    console.log('Using URL:', process.env.DATABASE_URL);

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });

    try {
        console.log(`Searching for: ${email}`);
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('FAIL: User not found');
            return;
        }

        console.log(`Found user: ${user.name}`);
        console.log(`DB Password: [${user.password}]`);
        console.log(`Input Password: [${password}]`);

        if (user.password === password) {
            console.log('SUCCESS: Passwords match!');
        } else {
            console.log('FAIL: Password mismatch');
        }
    } catch (e) {
        console.error('CRITICAL ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test('wiliam@grafica.com', 'Jojo!246040');
