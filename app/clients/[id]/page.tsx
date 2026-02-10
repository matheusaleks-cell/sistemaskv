"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Client, Order } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    Building2,
    Fingerprint,
    Search,
    Clock,
    FileText
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { clients, orders } = useAppStore()
    const [client, setClient] = useState<Client | null>(null)
    const [clientOrders, setClientOrders] = useState<Order[]>([])

    useEffect(() => {
        const foundClient = clients.find(c => c.id === id)
        if (foundClient) {
            setClient(foundClient)
            const history = orders.filter(o => o.clientId === id)
            setClientOrders(history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        }
    }, [id, clients, orders])

    if (!client) return (
        <div className="p-8 flex items-center justify-center h-full flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-700">Cliente não encontrado</h2>
            <Link href="/clients">
                <Button variant="outline">Voltar para Lista</Button>
            </Link>
        </div>
    )

    const totalSpent = clientOrders.reduce((acc, curr) => acc + curr.total, 0)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Link href="/clients">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white hover:shadow-sm">
                        <ArrowLeft className="h-5 w-5 text-slate-500" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">{client.name}</h1>
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 font-bold px-3">
                            {client.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                        </Badge>
                    </div>
                    <p className="text-slate-500 font-medium">Desde {format(new Date(client.createdAt), "MMMM 'de' yyyy", { locale: ptBR })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client Data */}
                <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
                    <div className="orange-gradient h-32 w-full relative">
                        <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center border-4 border-white">
                            <span className="text-2xl font-black text-orange-500">{client.name.charAt(0)}</span>
                        </div>
                    </div>
                    <CardContent className="pt-12 pb-8 px-8 space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</p>
                                    <p className="text-slate-700 font-bold">{client.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">E-mail</p>
                                    <p className="text-slate-700 font-bold truncate">{client.email || "Não informado"}</p>
                                </div>
                            </div>

                            {client.companyName && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl">
                                        <Building2 className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Razão Social</p>
                                        <p className="text-slate-700 font-bold">{client.companyName}</p>
                                    </div>
                                </div>
                            )}

                            {client.document && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl">
                                        <Fingerprint className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{client.type === 'PF' ? 'CPF' : 'CNPJ'}</p>
                                        <p className="text-slate-700 font-bold">{client.document}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <Search className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Origem</p>
                                    <p className="text-slate-700 font-bold">{client.origin || "Direto"}</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-50" />

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pedidos</p>
                                <p className="text-xl font-black text-slate-800">{clientOrders.length}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Investido</p>
                                <p className="text-lg font-black text-orange-600">R$ {totalSpent.toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Order History */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="px-8 pt-8 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-800">Histórico de Pedidos</CardTitle>
                                <CardDescription>Consulte os últimos orçamentos e Ordens de Serviço</CardDescription>
                            </div>
                            <Link href="/quotes/new">
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-6 h-10 shadow-lg shadow-orange-500/20">
                                    Novo Orçamento
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-8">
                            {clientOrders.length === 0 ? (
                                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                    <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">Nenhum pedido realizado ainda.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {clientOrders.map((order) => (
                                        <Link key={order.id} href={`/quotes/${order.id}`}>
                                            <div className="group flex items-center justify-between p-6 rounded-3xl border border-slate-50 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 cursor-pointer mb-4 last:mb-0">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                        order.status === 'QUOTE' ? "bg-slate-100 text-slate-500" : "bg-orange-100 text-orange-600"
                                                    )}>
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-slate-800">#{order.osNumber || order.id.slice(0, 8).toUpperCase()}</span>
                                                            <Badge variant="outline" className={cn(
                                                                "font-bold text-[10px] px-2 uppercase tracking-widest",
                                                                order.status === 'APPROVED' ? "bg-green-50 text-green-600 border-green-100" :
                                                                    order.status === 'QUOTE' ? "bg-slate-50 text-slate-600 border-slate-100" :
                                                                        "bg-blue-50 text-blue-600 border-blue-100"
                                                            )}>
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <div className="flex items-center text-slate-400 text-xs">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {format(new Date(order.createdAt), "dd/MM/yyyy")}
                                                            </div>
                                                            <div className="flex items-center text-slate-400 text-xs">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-slate-800 text-lg group-hover:text-orange-600 transition-colors">R$ {order.total.toFixed(2)}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Geral</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
