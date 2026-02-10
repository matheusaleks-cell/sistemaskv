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

        try {
            const client = new PrismaClient({
                datasources: { db: { url } }
            });
            const count = await client.user.count();
            await client.$disconnect();
            results.steps.push(`✅ ${name}: SUCCESS! Count: ${count}`);
            return true;
        } catch (e: any) {
            results.steps.push(`❌ ${name}: Failed. Error: ${e.message}`);
            return false;
        }
    }

    // 1. Test configured DATABASE_URL (Transaction Pooler - 6543)
    const dbUrl = process.env.DATABASE_URL || '';
    if (await tryConnection('DATABASE_URL (Transaction Mode)', dbUrl)) {
        return { success: true, message: 'DATABASE_URL connected successfully!', workingUrlType: 'DATABASE_URL', steps: results.steps };
    }

    // 2. Test configured DIRECT_URL (Direct Mode - 5432)
    const directUrl = process.env.DIRECT_URL || '';
    if (await tryConnection('DIRECT_URL (Direct Mode)', directUrl)) {
        return { success: true, message: 'DIRECT_URL connected successfully!', workingUrlType: 'DIRECT_URL', steps: results.steps };
    }

    // 3. Construct Session Mode
    try {
        const poolerHost = 'aws-0-sa-east-1.pooler.supabase.com';
        const pass = 'Jojo%21246040'; // Escaped password
        const sessionUrl = `postgresql://postgres.ptjvgmgivptnxmmsupot:${pass}@${poolerHost}:5432/postgres`;

        if (await tryConnection('Session Mode (Pooler Host:5432)', sessionUrl)) {
            return { success: true, message: 'Session Mode connected successfully!', workingUrlType: 'SESSION_MODE', steps: results.steps };
        }
    } catch (e) {
        results.steps.push('Failed to construct session URL');
    }

    return {
        success: false,
        message: 'All connection attempts failed.',
        steps: results.steps
    };
}
