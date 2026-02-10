"use client"

import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialCharts } from "@/components/financial/FinancialCharts"
import { AuditLogTable } from "@/components/financial/AuditLogTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react"

export default function FinancialPage() {
    const { currentUser, orders, settings, financialRecords } = useAppStore()
    const router = useRouter()

    if (currentUser?.role !== 'MASTER' || !settings.enableFinancial) {
        return (
            <div className="p-8">
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-red-50 border-red-200">
                    <h2 className="text-2xl font-bold text-red-800">Acesso Negado</h2>
                    <p className="text-red-600">
                        {currentUser?.role !== 'MASTER'
                            ? "Este módulo é exclusivo para usuários Master."
                            : "O Módulo Financeiro está desativado nas configurações."}
                    </p>
                </div>
            </div>
        )
    }

    // KPIs
    const totalRevenue = orders
        .filter(o => o.status !== 'QUOTE')
        .reduce((acc, o) => acc + o.total, 0);

    const totalOrders = orders.filter(o => o.status !== 'QUOTE').length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Financeiro & Auditoria</h2>
                <p className="text-muted-foreground">
                    Visão estratégica do negócio.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:border-emerald-500 transition-colors cursor-pointer" onClick={() => router.push('/financial/receivable')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {financialRecords
                                .filter(r => r.type === 'RECEIVABLE' && r.status === 'PENDING')
                                .reduce((acc, r) => acc + r.amount, 0)
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <p className="text-xs text-muted-foreground">Clique para gerenciar</p>
                    </CardContent>
                </Card>
                <Card className="hover:border-red-500 transition-colors cursor-pointer" onClick={() => router.push('/financial/payable')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {financialRecords
                                .filter(r => r.type === 'PAYABLE' && r.status === 'PENDING')
                                .reduce((acc, r) => acc + r.amount, 0)
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <p className="text-xs text-muted-foreground">Clique para gerenciar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Conversões de Orçamento</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {avgTicket.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Por pedido aprovado</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="charts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="charts">Gráficos</TabsTrigger>
                    <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
                </TabsList>
                <TabsContent value="charts" className="space-y-4">
                    <FinancialCharts />
                </TabsContent>
                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Ações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AuditLogTable />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
