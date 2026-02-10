'use server'

import prisma from '@/lib/prisma'

export async function loginAction(email: string, password?: string) {
    console.log('Login attempt for:', email);
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        console.log('User found in DB:', user ? 'Yes' : 'No');

        if (user && user.password === password) {
            console.log('Login successful for:', email);
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

        console.log('Login failed: Invalid credentials');
        return { success: false, error: 'Credenciais inválidas' }
    } catch (error) {
        console.error('Login error in server action:', error)
        return { success: false, error: 'Erro no servidor' }
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
