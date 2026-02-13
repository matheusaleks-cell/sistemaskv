"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Printer, CheckCircle2, TrendingUp, DollarSign } from "lucide-react"

interface StatCardsProps {
    stats: {
        quotes: number;
        quotesTrend: string;
        production: number;
        productionTrend: string;
        completed: number;
        completedTrend: string;
        revenue?: number;
        revenueTrend?: string;
    }
}

export function StatCards({ stats }: StatCardsProps) {
    const items = [
        {
            label: "Orçamentos",
            value: stats.quotes,
            icon: FileText,
            color: "text-orange-500",
            bg: "bg-orange-50",
            trend: stats.quotesTrend
        },
        {
            label: "Em Produção",
            value: stats.production,
            icon: Printer,
            color: "text-blue-500",
            bg: "bg-blue-50",
            trend: stats.productionTrend
        },
        {
            label: "Prontos para Entrega",
            value: stats.completed,
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            trend: stats.completedTrend
        }
    ]

    if (stats.revenue !== undefined) {
        items.push({
            label: "Faturamento (OS)",
            value: `R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            trend: stats.revenueTrend || "+0%"
        } as any)
    }

    return (
        <div className={`grid grid-cols-1 ${items.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
            {items.map((item: any) => (
                <Card key={item.label} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white/50 backdrop-blur-sm group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                                <TrendingUp className="h-3 w-3" />
                                {item.trend}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</h3>
                            <p className="text-2xl font-black text-slate-800 mt-1">{item.value}</p>
                        </div>
                        <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${item.color.replace('text', 'bg')} opacity-60`}
                                style={{ width: '40%' }} // Simple static progress for aesthetic
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
