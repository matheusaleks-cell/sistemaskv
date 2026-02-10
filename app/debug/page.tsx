"use client"

import { useState } from "react"
import { testDatabaseConnection } from "@/lib/actions/debug"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const runTest = async () => {
        setLoading(true)
        try {
            const data = await testDatabaseConnection()
            setResult(data)
        } catch (err: any) {
            setResult({ success: false, message: "Erro ao chamar server action", error: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <Card className="border-orange-500/50 shadow-lg bg-slate-950 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center">
                        <span className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse" />
                        Diagnóstico de Sistema (SKV Flow)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-slate-400">
                        Clique no botão abaixo para testar a conexão real entre o servidor (Netlify) e o banco de dados (Supabase).
                    </p>

                    <Button
                        onClick={runTest}
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12"
                    >
                        {loading ? "Testando..." : "Testar Conexão Agora"}
                    </Button>

                    {result && (
                        <div className={`p-4 rounded-xl border ${result.success ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                            <h3 className="font-bold text-lg mb-2">
                                {result.success ? "✅ Sucesso!" : "❌ Falha Detectada"}
                            </h3>
                            <p className="text-sm mb-4">{result.message}</p>

                            <pre className="bg-black/50 p-4 rounded-lg text-xs overflow-auto max-h-60 border border-white/10">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="text-xs text-slate-500 text-center">
                Este teste verifica variáveis de ambiente e tempo de resposta do PostgreSQL.
            </div>
        </div>
    )
}
