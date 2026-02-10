"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { KeyRound, LogOut, Settings, User } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function UserMenu() {
    const { currentUser, logout, updatePassword } = useAppStore()
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleUpdatePassword = () => {
        if (!newPassword) {
            setError("Digite a nova senha")
            return
        }
        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem")
            return
        }

        updatePassword(currentUser!.id, newPassword)
        setSuccess(true)
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => {
            setSuccess(false)
            setIsPasswordDialogOpen(false)
        }, 1500)
    }

    if (!currentUser) return null

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-white border border-slate-100 shadow-sm hover:border-orange-200 transition-all active:scale-95 group">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-xs font-black text-slate-800 tracking-tight">{currentUser.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 leading-none">{currentUser.role === 'MASTER' ? 'Gerência' : 'Equipe'}</span>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden group-hover:shadow-orange-200 transition-all">
                            <span className="text-sm font-black text-orange-600 uppercase">{currentUser.name.charAt(0)}</span>
                        </div>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100" align="end" sideOffset={8}>
                    <div className="space-y-1">
                        <div className="px-3 py-2 mb-1 border-b border-slate-50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sua Conta</p>
                        </div>

                        <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
                            setIsPasswordDialogOpen(open)
                            if (!open) {
                                setError("")
                                setSuccess(false)
                            }
                        }}>
                            <DialogTrigger asChild>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors">
                                    <KeyRound className="h-4 w-4" /> Alterar Senha
                                </button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[2.5rem] max-w-sm">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-xl font-black">
                                        <KeyRound className="h-5 w-5 text-orange-500" /> Alterar Senha
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nova Senha</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="h-11 rounded-2xl border-slate-100 bg-slate-50/50"
                                            placeholder="••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Confirmar Senha</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-11 rounded-2xl border-slate-100 bg-slate-50/50"
                                            placeholder="••••••"
                                        />
                                    </div>
                                    {error && <p className="text-xs font-bold text-red-500 px-1">{error}</p>}
                                    {success && <p className="text-xs font-bold text-green-600 px-1">✓ Senha atualizada com sucesso!</p>}
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleUpdatePassword}
                                        className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-12 font-bold"
                                        disabled={success}
                                    >
                                        Atualizar Senha
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut className="h-4 w-4" /> Sair do Sistema
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
