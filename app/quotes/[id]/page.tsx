"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Order, OrderStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Printer,
    MessageCircle,
    CheckCircle,
    ArrowLeft,
    FileText,
    Play,
    Check,
    Truck,
    Clock
} from "lucide-react"
import { format } from "date-fns"
import { generateQuotePDF, generateOSPDF, generateDeliveryCertificate } from "@/lib/services/pdfGenerator"
import Link from "next/link"

const STATUS_LABELS: Record<OrderStatus, string> = {
    QUOTE: 'ORÇAMENTO',
    APPROVED: 'AGUARDANDO PROD.',
    PRODUCTION: 'EM PRODUÇÃO',
    COMPLETED: 'PRONTO / FINALIZADO',
    DELIVERED: 'ENTREGUE'
};

const STATUS_COLORS: Record<OrderStatus, string> = {
    QUOTE: 'bg-slate-500',
    APPROVED: 'bg-blue-500',
    PRODUCTION: 'bg-orange-500',
    COMPLETED: 'bg-green-600',
    DELIVERED: 'bg-indigo-600'
};

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { orders, clients, updateOrderStatus, currentUser } = useAppStore()
    const [order, setOrder] = useState<Order | null>(null)
    const [client, setClient] = useState<any>(null)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (orders.length > 0) {
            const found = orders.find(o => o.id === id)
            if (found) {
                setOrder(found)
                const c = clients.find(cl => cl.id === found.clientId)
                setClient(c)
            }
            setLoading(false)
        }
        const timer = setTimeout(() => setLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [id, orders, clients])

    if (loading) return (
        <div className="p-8 flex items-center justify-center h-full flex-col gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="text-sm text-muted-foreground font-bold">Carregando detalhes...</p>
        </div>
    )

    if (!order) return (
        <div className="p-8 flex flex-col items-center justify-center h-full space-y-4">
            <h2 className="text-xl font-semibold text-slate-700">Pedido não encontrado</h2>
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

    const handleWhatsApp = () => {
        const message = `Olá ${order.clientName}, segue o resumo do seu orçamento:
        
*Orçamento #${order.id.slice(0, 4).toUpperCase()}*
Data: ${format(new Date(order.createdAt), 'dd/MM/yyyy')}
Total: R$ ${order.total.toFixed(2)}

${order.items.map((i: any) => `- ${i.productName} (${i.width}x${i.height}cm) x${i.quantity}`).join('\n')}

Podemos prosseguir?`

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    const advanceStep = () => {
        if (!currentUser) return;

        let nextStatus: OrderStatus = order.status;
        let confirmMsg = "";

        if (order.status === 'QUOTE') {
            nextStatus = 'APPROVED';
            confirmMsg = "Deseja APROVAR este orçamento e gerar a Ordem de Serviço?";
        } else if (order.status === 'APPROVED') {
            nextStatus = 'PRODUCTION';
            confirmMsg = "Deseja iniciar a PRODUÇÃO deste pedido?";
        } else if (order.status === 'PRODUCTION') {
            nextStatus = 'COMPLETED';
            confirmMsg = "O pedido está PRONTO para retirada / entrega?";
        } else if (order.status === 'COMPLETED') {
            nextStatus = 'DELIVERED';
            confirmMsg = "Confirmar que o pedido foi ENTREGUE ao cliente?";
        }

        if (confirmMsg && confirm(confirmMsg)) {
            updateOrderStatus(order.id, nextStatus, currentUser);
            if (nextStatus === 'DELIVERED') handlePrintDelivery();
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            {order.status === 'QUOTE' ? 'Orçamento' : 'Ordem de Serviço'}
                        </h2>
                        <Badge className={`${STATUS_COLORS[order.status]} text-white border-none px-3`}>
                            {STATUS_LABELS[order.status]}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">
                        {order.osNumber ? `OS #${order.osNumber}` : `Rascunho ID: ${order.id.slice(0, 8)}`}
                    </p>
                </div>

                <div className="md:ml-auto flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleWhatsApp} className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>

                    {order.status === 'QUOTE' ? (
                        <Button size="sm" variant="outline" onClick={handlePrintQuote}>
                            <Printer className="mr-2 h-4 w-4" /> Imp. Orçamento
                        </Button>
                    ) : (
                        <>
                            <Button size="sm" variant="outline" onClick={handlePrintOS}>
                                <Printer className="mr-2 h-4 w-4" /> Imp. O.S
                            </Button>
                            <Button size="sm" variant="outline" onClick={handlePrintDelivery}>
                                <FileText className="mr-2 h-4 w-4" /> Comprovante
                            </Button>
                        </>
                    )}

                    {order.status !== 'DELIVERED' && (
                        <Button onClick={advanceStep} className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 font-bold uppercase tracking-wider px-6">
                            {order.status === 'QUOTE' && <CheckCircle className="mr-2 h-4 w-4" />}
                            {order.status === 'APPROVED' && <Play className="mr-2 h-4 w-4" />}
                            {order.status === 'PRODUCTION' && <Check className="mr-2 h-4 w-4" />}
                            {order.status === 'COMPLETED' && <Truck className="mr-2 h-4 w-4" />}
                            {order.status === 'QUOTE' ? 'Aprovar Pedido' :
                                order.status === 'APPROVED' ? 'Iniciar Produção' :
                                    order.status === 'PRODUCTION' ? 'Finalizar Produção' :
                                        order.status === 'COMPLETED' ? 'Confirmar Entrega' : ''}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg font-bold">Itens do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start border-b pb-6 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-800">{item.productName}</p>
                                            <div className="flex gap-4 text-sm text-slate-500 font-medium">
                                                <span>{item.width}cm x {item.height}cm</span>
                                                <span>Qtd: {item.quantity}</span>
                                            </div>
                                            {item.finish && (
                                                <div className="mt-2 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
                                                    <strong>Acabamento:</strong> {item.finish}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-900">R$ {item.totalPrice.toFixed(2)}</p>
                                            <p className="text-xs font-bold text-slate-400">R$ {item.unitPrice.toFixed(2)} un.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/80 p-6 flex justify-between items-center border-t">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Valor Total</span>
                            <span className="text-3xl font-black text-orange-600">R$ {order.total.toFixed(2)}</span>
                        </CardFooter>
                    </Card>

                    {order.status !== 'QUOTE' && (
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    Timeline de Produção
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">Pedido Aprovado</p>
                                        <p className="text-xs text-slate-500">{format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm")}</p>
                                    </div>
                                </div>
                                {order.productionStart && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">Início da Produção</p>
                                            <p className="text-xs text-slate-500">{format(new Date(order.productionStart), "dd/MM/yyyy 'às' HH:mm")}</p>
                                        </div>
                                    </div>
                                )}
                                {order.finishedAt && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">Produção Finalizada</p>
                                            <p className="text-xs text-slate-500">{format(new Date(order.finishedAt), "dd/MM/yyyy 'às' HH:mm")}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-bold text-slate-800">{order.clientName}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{order.clientId}</p>
                            </div>

                            {client?.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MessageCircle className="w-4 h-4" />
                                    {client.phone}
                                </div>
                            )}

                            {order.hasShipping && (
                                <div className="pt-4 border-t space-y-2">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Entrega</p>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                        {order.shippingAddress || "A retirar na loja"}
                                    </p>
                                    <Badge variant="secondary" className="bg-orange-50 text-orange-600 hover:bg-orange-50 font-bold border-orange-100">
                                        Frete: R$ {order.shippingValue?.toFixed(2)}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="ghost" onClick={handlePrintQuote} className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/10">
                                <Printer className="mr-3 h-4 w-4" /> Reimprimir Orçamento
                            </Button>
                            {order.status !== 'QUOTE' && (
                                <Button variant="ghost" onClick={handlePrintOS} className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/10">
                                    <Printer className="mr-3 h-4 w-4" /> Reimprimir O.S
                                </Button>
                            )}
                            <Button variant="ghost" onClick={handleWhatsApp} className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/10">
                                <MessageCircle className="mr-3 h-4 w-4" /> Enviar p/ Cliente
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
