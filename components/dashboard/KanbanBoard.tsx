"use client"

import { useAppStore } from "@/lib/store"
import { KanbanCard } from "./KanbanCard"
import { OrderStatus } from "@/types"
import { differenceInDays } from "date-fns"
import { AlertCircle } from "lucide-react"

export function KanbanBoard() {
    const { orders, updateOrderStatus, currentUser } = useAppStore()

    const columns: { id: OrderStatus, title: string, color: string }[] = [
        { id: 'QUOTE', title: 'Orçamentos', color: 'bg-zinc-100' },
        { id: 'APPROVED', title: 'Aprovados', color: 'bg-blue-50' },
        { id: 'PRODUCTION', title: 'Em Produção', color: 'bg-yellow-50' },
        { id: 'COMPLETED', title: 'Concluídos', color: 'bg-green-50' },
        { id: 'DELIVERED', title: 'Entregues', color: 'bg-slate-100' },
    ]

    const handleMove = (id: string, newStatus: OrderStatus) => {
        if (currentUser) {
            updateOrderStatus(id, newStatus, currentUser);
        }
    }

    const lateOrders = orders.filter(o =>
        o.deadline &&
        differenceInDays(new Date(o.deadline), new Date()) < 0 &&
        o.status !== 'DELIVERED' &&
        o.status !== 'COMPLETED'
    );

    return (
        <div className="space-y-6">
            {lateOrders.length > 0 && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <div>
                        <p className="font-bold">Atenção: {lateOrders.length} pedido(s) em atraso!</p>
                        <p className="text-sm">Verifique os cards marcados em vermelho.</p>
                    </div>
                </div>
            )}

            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] min-h-[500px]">
                {columns.map(col => {
                    const colOrders = orders.filter(o => o.status === col.id)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    return (
                        <div key={col.id} className={`flex-shrink-0 w-80 rounded-lg flex flex-col ${col.color}`}>
                            <div className="p-3 font-semibold border-b border-black/5 flex justify-between items-center">
                                <span>{col.title}</span>
                                <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">{colOrders.length}</span>
                            </div>
                            <div className="p-3 flex-1 overflow-y-auto space-y-3">
                                {colOrders.length === 0 && (
                                    <div className="text-center text-muted-foreground text-sm py-8 opacity-50">Vazio</div>
                                )}
                                {colOrders.map(order => (
                                    <KanbanCard key={order.id} order={order} onMove={handleMove} />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
