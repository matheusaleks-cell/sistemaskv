'use server'

import { Pool } from 'pg'

export async function testDatabaseConnection() {
    console.log('--- DEBUG: Connection Test (PG Native) ---');

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
            pool = new Pool({
                connectionString: url,
                connectionTimeoutMillis: 10000,
                ssl: url.includes('supabase') ? { rejectUnauthorized: false } : false
            });

            // Try a quick query
            const res = await pool.query('SELECT NOW()');
            results.steps.push(`✅ ${name}: Database Network OK. Time: ${res.rows[0].now}`);

            // Test User count (Native SQL)
            const countRes = await pool.query('SELECT COUNT(*) FROM "User"');
            const count = countRes.rows[0].count;

            results.steps.push(`✅ ${name}: Query OK! Users: ${count}`);
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

    return {
        success: false,
        message: 'All connection attempts failed.',
        steps: results.steps
    };
}
