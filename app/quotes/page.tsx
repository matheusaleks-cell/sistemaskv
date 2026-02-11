"use client"

import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus } from "lucide-react"

export default function QuotesPage() {
    const { orders } = useAppStore()
    // Filter only quotes or all? Usually "Quotes" module shows all, but focuses on creation.
    // Or maybe just status = QUOTE.
    // The user requirement says "Orçamentos" tab.
    // Let's show all for now but usually we want to see active quotes.
    // I'll show all and maybe add a filter later.

    const quotes = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Orçamentos & Pedidos</h2>
                    <p className="text-muted-foreground">
                        Histórico completo de orçamentos e ordens de serviço.
                    </p>
                </div>
                <Link href="/quotes/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Orçamento
                    </Button>
                </Link>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Produtos</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum orçamento encontrado.</TableCell>
                            </TableRow>
                        ) : quotes.map((quote) => (
                            <TableRow key={quote.id}>
                                <TableCell>{format(new Date(quote.createdAt), "dd/MM/yyyy")}</TableCell>
                                <TableCell className="font-medium">{quote.clientName}</TableCell>
                                <TableCell>{quote.items.length} item(s)</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        quote.status === 'APPROVED' ? 'default' :
                                            quote.status === 'QUOTE' ? 'secondary' :
                                                quote.status === 'PRODUCTION' ? 'warning' :
                                                    quote.status === 'COMPLETED' ? 'success' : 'outline'
                                    }>
                                        {quote.status === 'QUOTE' ? 'ORÇAMENTO' :
                                            quote.status === 'APPROVED' ? 'APROVADO' :
                                                quote.status === 'PRODUCTION' ? 'EM PRODUÇÃO' :
                                                    quote.status === 'COMPLETED' ? 'FINALIZADO' :
                                                        quote.status === 'DELIVERED' ? 'ENTREGUE' : quote.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">R$ {quote.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => window.location.href = `/quotes/${quote.id}`}>
                                        Ver
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
