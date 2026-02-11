"use client"

import { Order, OrderStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, differenceInDays } from "date-fns"
import { ArrowRight, ArrowLeft, AlertTriangle, Clock } from "lucide-react"
import Link from "next/link"

interface KanbanCardProps {
    order: Order;
    onMove: (id: string, newStatus: OrderStatus) => void;
}

export function KanbanCard({ order, onMove }: KanbanCardProps) {
    const today = new Date();
    const deadline = order.deadline ? new Date(order.deadline) : null;
    let statusColor = "bg-green-100 border-green-300";
    let statusIcon = <Clock className="w-3 h-3 text-green-700" />;

    if (deadline) {
        const diff = differenceInDays(deadline, today);
        if (diff < 0) {
            statusColor = "bg-red-100 border-red-300";
            statusIcon = <AlertTriangle className="w-3 h-3 text-red-700" />;
        } else if (diff <= 2) {
            statusColor = "bg-yellow-100 border-yellow-300";
            statusIcon = <AlertTriangle className="w-3 h-3 text-yellow-700" />;
        }
    }

    const nextStatusMap: Record<string, OrderStatus> = {
        'QUOTE': 'ART',
        'ART': 'APPROVED',
        'APPROVED': 'PRODUCTION',
        'PRODUCTION': 'COMPLETED',
        'COMPLETED': 'DELIVERED',
    };

    const prevStatusMap: Record<string, OrderStatus> = {
        'ART': 'QUOTE',
        'APPROVED': 'ART',
        'PRODUCTION': 'APPROVED',
        'COMPLETED': 'PRODUCTION',
        'DELIVERED': 'COMPLETED'
    };

    // Logic: Only show Move buttons if meaningful.
    // 'QUOTE' -> 'APPROVED' usually happens via "Approve" button which generates OS, but we can allow drag too.
    // If 'APPROVED', next is 'PRODUCTION'.

    return (
        <Card className={`mb-3 shadow-sm hover:shadow-md transition-shadow border-l-4 ${order.status !== 'DELIVERED' && order.status !== 'COMPLETED' ? statusColor.replace('bg-', 'border-l-') : ''}`}>
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 4)}</span>
                        <h4 className="font-semibold text-sm line-clamp-1">{order.clientName}</h4>
                    </div>
                    {deadline && (
                        <div className={`p-1 rounded-full ${statusColor}`}>
                            {statusIcon}
                        </div>
                    )}
                </div>

                <div className="text-xs text-muted-foreground">
                    <p>{order.items.length} item(s)</p>
                    <p className="font-medium text-foreground">R$ {order.total.toFixed(2)}</p>
                </div>

                {order.deadline && (
                    <div className="text-xs">
                        <span className="font-medium">Prazo:</span> {format(new Date(order.deadline), 'dd/MM')}
                    </div>
                )}

                <Link href={`/quotes/${order.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs h-7">Ver Detalhes</Button>
                </Link>

                <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                    {prevStatusMap[order.status] && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-slate-600"
                            onClick={() => onMove(order.id, prevStatusMap[order.status])}
                        >
                            <ArrowLeft className="w-3 h-3" />
                        </Button>
                    )}
                    <div className="flex-1" />
                    {nextStatusMap[order.status] && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-[10px] font-bold px-3 flex items-center gap-1 bg-white hover:bg-slate-50 border shadow-xs text-slate-700"
                            onClick={() => onMove(order.id, nextStatusMap[order.status])}
                        >
                            {order.status === 'QUOTE' ? 'P/ Arte' :
                                order.status === 'ART' ? 'Aprovar' :
                                    order.status === 'APPROVED' ? 'Produzir' :
                                        order.status === 'PRODUCTION' ? 'Finalizar' : 'Entregar'}
                            <ArrowRight className="w-3 h-3" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
