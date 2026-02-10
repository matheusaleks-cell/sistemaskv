"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Order } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Printer,
    MessageCircle,
    CheckCircle,
    ArrowLeft,
    FileText
} from "lucide-react"
import { format } from "date-fns"
import { generateQuotePDF, generateOSPDF, generateDeliveryCertificate } from "@/lib/services/pdfGenerator"
import Link from "next/link"

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { orders, clients, updateOrderStatus, currentUser } = useAppStore()
    const [order, setOrder] = useState<Order | null>(null)
    const [client, setClient] = useState<any>(null)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Debug logs
        console.log("Params ID:", id)
        console.log("Orders available:", orders.length)

        if (orders.length > 0) {
            const found = orders.find(o => o.id === id)
            if (found) {
                setOrder(found)
                const c = clients.find(cl => cl.id === found.clientId)
                setClient(c)
            }
            // Only stop loading if we actually searched (orders loaded)
            setLoading(false)
        }
        // Force stop loading after timeout even if orders are empty (maybe really empty)
        const timer = setTimeout(() => setLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [id, orders])

    if (loading) return (
        <div className="p-8 flex items-center justify-center h-full flex-col gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
        </div>
    )

    if (!order) return (
        <div className="p-8 flex flex-col items-center justify-center h-full space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Orçamento não encontrado</h2>
            <p className="text-slate-500">ID Buscado: {id}</p>
            <p className="text-xs text-slate-400">Total de pedidos no sistema: {orders.length}</p>
            <div className="text-xs text-left w-full max-w-md bg-slate-100 p-4 rounded overflow-auto max-h-40">
                <p className="font-bold mb-2">IDs Disponíveis:</p>
                {orders.map(o => <span key={o.id} className="block font-mono">{o.id}</span>)}
            </div>
            <Link href="/quotes">
                <Button variant="outline">Voltar para Lista</Button>
            </Link>
        </div>
    )

    const handlePrintQuote = () => {
        const doc = generateQuotePDF(order, client)
        const identifier = order.osNumber || order.id.slice(0, 8).toUpperCase()
        doc.save(`Orcamento_${identifier}_${order.clientName}.pdf`)
    }

    const handlePrintOS = () => {
        const doc = generateOSPDF(order, client)
        const identifier = order.osNumber || order.id.slice(0, 8).toUpperCase()
        doc.save(`OS_${identifier}_${order.clientName}.pdf`)
    }

    const handlePrintDelivery = () => {
        const doc = generateDeliveryCertificate(order, client)
        const identifier = order.osNumber || order.id.slice(0, 8).toUpperCase()
        doc.save(`Comprovante_Entrega_${identifier}_${order.clientName}.pdf`)
    }

    const handleApprove = () => {
        if (confirm("Deseja aprovar este orçamento e gerar uma Ordem de Serviço?")) {
            if (currentUser) {
                updateOrderStatus(order.id, 'APPROVED', currentUser)
                alert("Orçamento aprovado com sucesso! OS gerada.")
            }
        }
    }

    const handleUpdateStatus = (newStatus: Order['status']) => {
        if (!currentUser) return

        updateOrderStatus(order.id, newStatus, currentUser)

        if (newStatus === 'COMPLETED' || newStatus === 'DELIVERED') {
            if (confirm("Pedido finalizado! Deseja gerar o Comprovante de Entrega para assinatura?")) {
                handlePrintDelivery()
            }
        }
    }

    const handleWhatsApp = () => {
        const message = `Olá ${order.clientName}, segue o resumo do seu orçamento:
        
*Orçamento #${order.id.slice(0, 4).toUpperCase()}*
Data: ${format(new Date(order.createdAt), 'dd/MM/yyyy')}
Total: R$ ${order.total.toFixed(2)}

${order.items.map((i: any) => `- ${i.productName} (${i.width}x${i.height}cm) x${i.quantity}`).join('\n')}

Podemos prosseguir?`

        // Encode and open
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/quotes">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Detalhes do Pedido</h2>
                    <p className="text-muted-foreground">ID: {order.id}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={handlePrintQuote}>
                        <Printer className="mr-2 h-4 w-4" /> Orçamento
                    </Button>
                    <Button variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200" onClick={handleWhatsApp}>
                        <MessageCircle className="mr-2 h-4 w-4" /> Zap
                    </Button>

                    {order.status === 'QUOTE' ? (
                        <Button onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700">
                            <CheckCircle className="mr-2 h-4 w-4" /> Aprovar Orçamento
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePrintDelivery} className="border-orange-200 text-orange-600 hover:bg-orange-50">
                                <FileText className="mr-2 h-4 w-4" /> Entr.
                            </Button>
                            <Button variant="secondary" onClick={handlePrintOS} className="bg-slate-800 text-white hover:bg-slate-900">
                                <FileText className="mr-2 h-4 w-4" /> Imprimir OS
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Itens do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.width}cm x {item.height}cm | Qtd: {item.quantity}
                                    </p>
                                    {item.finish && <p className="text-xs text-zinc-500 mt-1">Obs: {item.finish}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">R$ {item.totalPrice.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">R$ {item.unitPrice.toFixed(2)} un.</p>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end pt-4">
                            <div className="text-right">
                                <span className="text-muted-foreground mr-4">Total</span>
                                <span className="text-xl font-bold">R$ {order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge className="w-full justify-center py-1 text-base" variant={
                                order.status === 'APPROVED' ? 'default' :
                                    order.status === 'QUOTE' ? 'secondary' :
                                        order.status === 'PRODUCTION' ? 'warning' : 'success'
                            }>
                                {order.status}
                            </Badge>

                            {order.status === 'PRODUCTION' && (
                                <Button
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700 font-bold"
                                    onClick={() => handleUpdateStatus('COMPLETED')}
                                >
                                    Marcar como Pronto
                                </Button>
                            )}

                            {order.status === 'COMPLETED' && (
                                <Button
                                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 font-bold"
                                    onClick={() => handleUpdateStatus('DELIVERED')}
                                >
                                    Confirmar Entrega
                                </Button>
                            )}
                            {order.osNumber && (
                                <div className="mt-4 p-3 bg-slate-100 rounded text-center">
                                    <p className="text-xs text-muted-foreground">Número da OS</p>
                                    <p className="font-mono font-bold text-lg">{order.osNumber}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{order.clientName}</p>
                            <p className="text-sm text-muted-foreground mt-1">ID: {order.clientId}</p>
                            {order.hasShipping && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Logística de Entrega</p>
                                    <p className="text-sm text-slate-700 mt-1 font-medium">{order.shippingAddress || "A retirar"}</p>
                                    <p className="text-xs text-orange-600 font-bold mt-1">Frete: R$ {order.shippingValue?.toFixed(2)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
