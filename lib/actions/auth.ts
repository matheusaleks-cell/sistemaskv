'use server'

import prisma from '@/lib/prisma'

export async function loginAction(identifier: string, password?: string) {
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Identifier provided:', identifier);
    try {
        // Try to find by name first (requested Nome e Senha)
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { name: identifier },
                    { email: identifier }
                ]
            }
        })

        if (!user) {
            console.log('Login failed: User NOT found in database');
            return { success: false, error: 'Credenciais inválidas' }
        }

        console.log('User found:', user.name);

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
