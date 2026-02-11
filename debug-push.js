const { execSync } = require('child_process');
require('dotenv').config();

console.log('Current DATABASE_URL in JS:', process.env.DATABASE_URL);

try {
    console.log('Running db push...');
    execSync('npx prisma db push', {
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
        stdio: 'inherit'
    });
} catch (e) {
    console.error('Failed.');
}
