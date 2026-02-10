'use server'

import prisma from '@/lib/prisma'

export async function loginAction(email: string, password?: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (user && user.password === password) {
            // In a real app, you'd set a cookie here or use NextAuth
            // For now, we'll just return the user data to the client store
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

        return { success: false, error: 'Credenciais inválidas' }
    } catch (error) {
        console.error('Login error:', error)
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
