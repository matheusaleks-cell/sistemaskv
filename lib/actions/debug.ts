'use server'

import { PrismaClient } from '@prisma/client'

export async function testDatabaseConnection() {
    console.log('--- DEBUG: Advanced Connection Test ---');

    const results = {
        steps: [] as string[],
        success: false,
        message: '',
        workingUrlType: ''
    };

    const tryConnection = async (name: string, url: string) => {
        results.steps.push(`Testing ${name}... URL Present: ${!!url}`);
        if (!url) {
            results.steps.push(`❌ ${name}: URL not defined`);
            return false;
        }

        let pool;
        try {
            // Test with direct pg first to verify network
            const { Pool } = await import('pg');
            const { PrismaPg } = await import('@prisma/adapter-pg');

            pool = new Pool({
                connectionString: url,
                connectionTimeoutMillis: 10000,
                ssl: url.includes('supabase') ? { rejectUnauthorized: false } : false
            });

            // Try a quick query
            const res = await pool.query('SELECT NOW()');
            results.steps.push(`✅ ${name}: Database Network OK. Time: ${res.rows[0].now}`);

            // Now test with Prisma and the same adapter pattern the app uses
            const adapter = new PrismaPg(pool);
            const client = new PrismaClient({ adapter });

            const count = await client.user.count();
            await client.$disconnect();

            results.steps.push(`✅ ${name}: Prisma connected! Users: ${count}`);
            return true;
        } catch (e: any) {
            results.steps.push(`❌ ${name}: Failed. Error: ${e.message}`);
            return false;
        } finally {
            if (pool) {
                try {
                    await pool.end();
                } catch (err) { }
            }
        }
    }

    // 1. Test configured DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || '';
    if (await tryConnection('DATABASE_URL (Main)', dbUrl)) {
        return { success: true, message: 'DATABASE_URL connected successfully!', workingUrlType: 'DATABASE_URL', steps: results.steps };
    }

    // 2. Test configured DIRECT_URL
    const directUrl = process.env.DIRECT_URL || '';
    if (await tryConnection('DIRECT_URL (Direct)', directUrl)) {
        return { success: true, message: 'DIRECT_URL connected successfully!', workingUrlType: 'DIRECT_URL', steps: results.steps };
    }

    // 3. Construct Pooler URL manually for fallback check
    try {
        const pass = 'Jojo%21246040';
        const projectRef = 'pgviebosymajwqcucljd';
        const sessionUrl = `postgresql://postgres.${projectRef}:${pass}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`;

        if (await tryConnection('Manual Pooler (5432)', sessionUrl)) {
            return { success: true, message: 'Manual connection successful!', workingUrlType: 'MANUAL', steps: results.steps };
        }
    } catch (e) {
        results.steps.push('Failed to construct manual URL');
    }

    return {
        success: false,
        message: 'All connection attempts failed.',
        steps: results.steps
    };
}
