const { execSync } = require('child_process');
require('dotenv').config();

try {
    console.log('Generating Prisma Client with DATABASE_URL from .env...');
    execSync('npx prisma generate', {
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
        stdio: 'inherit'
    });
    console.log('Success!');
} catch (e) {
    console.error('Failed to generate.');
}
