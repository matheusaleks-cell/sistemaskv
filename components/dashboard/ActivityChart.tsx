"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ActivityChart() {
    return (
        <Card className="col-span-1 border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                    <CardTitle className="text-lg font-bold text-slate-800">Fluxo de Atividade</CardTitle>
                    <p className="text-xs text-slate-400 font-medium">Volume de pedidos nos últimos 6 meses</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Orçamentos
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full flex items-end gap-3 px-2">
                    {[35, 45, 25, 60, 40, 55, 75, 45, 65, 50, 80, 45].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <div
                                className="w-full bg-orange-100 rounded-t-lg relative overflow-hidden transition-all duration-500 hover:bg-orange-500 cursor-pointer"
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase">{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i] || 'Alt'}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
