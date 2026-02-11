'use server'

import prisma from '@/lib/prisma'

export async function loginAction(email: string, password?: string) {
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Email provided:', email);
    console.log('Password provided:', password);
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            console.log('Login failed: User NOT found in database');
            return { success: false, error: 'Credenciais inválidas' }
        }

        console.log('User found:', user.email);
        console.log('Database password:', user.password);

        if (user.password === password) {
            console.log('Login SUCCESS');
            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        }

        console.log('Login failed: Password mismatch');
        return { success: false, error: 'Credenciais inválidas' }
    } catch (error: any) {
        console.error('Login CRITICAL error:', error.message)
        return { success: false, error: 'Erro no servidor: ' + error.message }
    }
}

export async function updatePasswordAction(userId: string, newPassword: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { password: newPassword },
        })
        return { success: true }
    } catch (error) {
        console.error('Update password error:', error)
        return { success: false }
    }
}
