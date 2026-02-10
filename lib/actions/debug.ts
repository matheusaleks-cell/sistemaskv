'use server'

import prisma from '@/lib/prisma'

export async function testDatabaseConnection() {
    console.log('--- DEBUG: Testing DB Connection from Server Action ---');
    try {
        // 1. Check if environment variables are present
        const hasDirectUrl = !!process.env.DIRECT_URL;
        const directUrlLength = process.env.DIRECT_URL?.length || 0;

        console.log(`DIRECT_URL present: ${hasDirectUrl}, length: ${directUrlLength}`);

        // 2. Try a simple query
        const start = Date.now();
        const userCount = await prisma.user.count();
        const duration = Date.now() - start;

        console.log(`Query successful. User count: ${userCount}. Duration: ${duration}ms`);

        return {
            success: true,
            message: 'Conexão com banco de dados OK!',
            details: {
                userCount,
                duration: `${duration}ms`,
                envCheck: hasDirectUrl ? 'DIRECT_URL configurada' : 'ERRO: DIRECT_URL ausente'
            }
        };
    } catch (error: any) {
        console.error('--- DEBUG: DB Connection Failed ---');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        return {
            success: false,
            message: 'Falha na conexão com o banco de dados',
            error: error.message,
            code: error.code || 'UNKNOWN'
        };
    }
}
