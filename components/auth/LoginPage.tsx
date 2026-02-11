"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, User, KeyRound, Bug } from "lucide-react"

export function LoginPage() {
    const { login } = useAppStore()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(false)
        setErrorMessage("")

        try {
            const { loginAction } = await import('@/lib/actions/auth');
            const result = await loginAction(email, password);

            if (result.success && result.user) {
                // The store login function also sets the user, but we can do it here if needed
                // actually loginAction is just a server action. 
                // We should use the store's login to maintain consistency
                const success = await login(email, password);
                if (!success) {
                    setError(true)
                    setErrorMessage("Erro ao salvar sessão local")
                }
            } else {
                setError(true)
                setErrorMessage(result.error || "Credenciais inválidas")
            }
        } catch (err: any) {
            setError(true)
            setErrorMessage("Erro de servidor: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-900 font-sans">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-orange-600/10 blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px] animate-pulse delay-1000" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[100px] animate-pulse delay-2000" />
            </div>

            <div className="relative z-10 w-full max-w-md p-8 m-4">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl" />

                <div className="relative z-20 space-y-8 text-center">
                    <div className="space-y-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl mb-4 rotate-3">
                            <span className="text-4xl font-black text-white">S</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white italic">
                            SKV <span className="text-orange-400 not-italic uppercase text-2xl ml-1">Flow</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">
                            Gestão de Produção & Comunicação Visual
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6 text-left">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome de Usuário</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="email"
                                        type="text"
                                        placeholder="Digite seu nome"
                                        className="pl-10 bg-slate-950/40 border-slate-800 text-slate-100 focus:border-orange-500 focus:ring-orange-500/20 h-11 transition-all rounded-xl"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            setError(false)
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 bg-slate-950/40 border-slate-800 text-slate-100 focus:border-orange-500 focus:ring-orange-500/20 h-11 transition-all rounded-xl"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            setError(false)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center animate-in fade-in slide-in-from-top-1">
                                <KeyRound className="w-3.5 h-3.5 mr-2" />
                                {errorMessage}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-orange-500 hover:bg-orange-400 text-white font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Autenticando...
                                </span>
                            ) : "Acessar Dashboard"}
                        </Button>
                    </form>


                </div>
            </div>
        </div>
    )
}
