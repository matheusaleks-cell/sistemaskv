"use client"

import { useAppStore } from "@/lib/store"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { format } from "date-fns"

export function ProductionList() {
    const { orders, updateOrderStatus, currentUser } = useAppStore()
    const [searchTerm, setSearchTerm] = useState("")

    const productionOrders = orders.filter(o => o.status === 'PRODUCTION')
    const filteredOrders = productionOrders.filter(o =>
        o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.osNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleComplete = (id: string) => {
        if (!currentUser) return;
        if (confirm("Marcar produção como concluída?")) {
            updateOrderStatus(id, 'COMPLETED', currentUser)
        }
    }

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fila de Produção</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar OS ou Cliente..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>OS</TableHead>
                            <TableHead>Data Entrada</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido em produção.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono font-bold text-slate-700">
                                        {order.osNumber}
                                    </TableCell>
                                    <TableCell>
                                        {order.productionStart ? format(new Date(order.productionStart), 'dd/MM HH:mm') : '-'}
                                    </TableCell>
                                    <TableCell className="font-medium">{order.clientName}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {order.items.map((item, idx) => (
                                                <span key={idx} className="text-xs bg-slate-100 px-2 py-1 rounded inline-block w-fit">
                                                    {item.quantity}x {item.productName}
                                                    {item.width > 0 && ` (${item.width}x${item.height})`}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="warning" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                                            Em Produção
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-slate-500 hover:text-slate-700"
                                                onClick={() => window.location.href = `/quotes/${order.id}`}
                                            >
                                                Ver
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200"
                                                onClick={() => handleComplete(order.id)}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" /> Concluir
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
