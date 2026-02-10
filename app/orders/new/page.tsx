"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Trash, Plus, Calculator, Building2,
    Fingerprint,
    Search,
    Clock,
    FileText,
    ArrowLeft,
    Printer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { OrderItem } from "@/types"
import { v4 as uuidv4 } from "uuid"
import { ClientQuickDialog } from "@/components/quotes/ClientQuickDialog"
import { ItemCostDialog } from "@/components/quotes/ItemCostDialog"

export default function NewDirectOrderPage() {
    const router = useRouter()
    const { clients, products, addDirectOrder } = useAppStore()

    const [clientId, setClientId] = useState("")
    const [hasShipping, setHasShipping] = useState(false)
    const [shippingAddress, setShippingAddress] = useState("")
    const [shippingValue, setShippingValue] = useState(0)

    const [items, setItems] = useState<Partial<OrderItem>[]>([
        { id: uuidv4(), width: 0, height: 0, quantity: 1, unitPrice: 0, totalPrice: 0 }
    ])

    // Helper to get product details
    const getProduct = (id?: string) => products.find(p => p.id === id);

    const calculateAutoPrice = (item: Partial<OrderItem>): { unitPrice: number, totalPrice: number, costs?: any } => {
        if (!item.productId) return { unitPrice: 0, totalPrice: 0 };
        const product = getProduct(item.productId);
        if (!product) return { unitPrice: 0, totalPrice: 0 };

        let unitPrice = 0;
        const q = item.quantity || 1;

        if (product.pricingType === 'FIXED') {
            unitPrice = product.price;
        } else {
            // Area based
            const w = item.width || 0;
            const h = item.height || 0;
            const areaM2 = (w * h) / 10000;
            unitPrice = areaM2 * product.price;
        }

        let totalPrice = unitPrice * q;

        // Apply minimum price rule to the TOTAL of the item
        if (product.minPrice && totalPrice < product.minPrice) {
            totalPrice = product.minPrice;
            unitPrice = totalPrice / q;
        }

        return {
            unitPrice: Number(unitPrice.toFixed(2)),
            totalPrice: Number(totalPrice.toFixed(2)),
            costs: item.costs || {
                taxPercent: 13,
                markupPercent: 30,
                itemCost: product.pricingType === 'FIXED' ? product.price * 0.4 : 0
            }
        };
    }

    const updateItem = (id: string, field: string, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };

                // Auto-calculate price if critical fields change
                if (['productId', 'width', 'height', 'quantity'].includes(field)) {
                    const { unitPrice, totalPrice, costs } = calculateAutoPrice(updated);
                    updated.unitPrice = unitPrice;
                    updated.totalPrice = totalPrice;
                    updated.costs = costs;
                }
                // If manual unit price edit
                else if (field === 'unitPrice') {
                    const product = getProduct(updated.productId);
                    let calcTotal = (updated.unitPrice || 0) * (updated.quantity || 1);

                    if (product?.minPrice && calcTotal < product.minPrice) {
                        updated.totalPrice = product.minPrice;
                    } else {
                        updated.totalPrice = Number(calcTotal.toFixed(2));
                    }
                }
                return updated;
            }
            return item;
        }))
    }

    const removeItem = (id: string) => {
        if (items.length === 1) return;
        setItems(prev => prev.filter(i => i.id !== id));
    }

    const addItem = () => {
        setItems(prev => [...prev, { id: uuidv4(), width: 0, height: 0, quantity: 1, unitPrice: 0, totalPrice: 0 }])
    }

    const getTotal = () => {
        const itemsTotal = items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
        return itemsTotal + (hasShipping ? shippingValue : 0);
    }

    const handleSave = () => {
        if (!clientId) {
            alert("Selecione um cliente");
            return;
        }

        const client = clients.find(c => c.id === clientId);
        if (!client) return;

        const validItems: OrderItem[] = [];

        for (const item of items) {
            if (!item.productId) {
                alert("Selecione o produto em todos os itens");
                return;
            }
            const product = getProduct(item.productId)!;

            if (product.pricingType === 'AREA' && (!item.width || !item.height)) {
                alert(`Informe as dimensões para o produto: ${product.name}`);
                return;
            }

            validItems.push({
                id: item.id || uuidv4(),
                productId: item.productId,
                productName: product.name,
                width: Number(item.width) || 0,
                height: Number(item.height) || 0,
                quantity: Number(item.quantity) || 1,
                finish: item.finish || "",
                unitPrice: Number(item.unitPrice) || 0,
                totalPrice: Number(item.totalPrice) || 0,
                costs: item.costs as any
            });
        }

        addDirectOrder({
            clientId: client.id,
            clientName: client.name,
            items: validItems,
            total: getTotal(),
            hasShipping,
            shippingAddress,
            shippingValue: hasShipping ? shippingValue : 0
        });

        router.push("/production");
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="p-0 hover:bg-transparent text-slate-500 hover:text-orange-500 mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
                    </Button>
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-sm mb-2">
                        <Calculator className="h-4 w-4" /> Ferramenta de Custos Integrada
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Novo Pedido Direto</h2>
                    <p className="text-slate-400 font-medium mt-1">Lançamento imediato para produção sem passar por orçamento.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/')} className="rounded-2xl h-12 px-6 font-bold border-slate-200">Cancelar</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
                        <CardHeader className="border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Dados do Cliente</CardTitle>
                                <CardDescription>Selecione ou cadastre um novo cliente</CardDescription>
                            </div>
                            <ClientQuickDialog />
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Cliente Ativo</Label>
                                    <Select onValueChange={setClientId} value={clientId}>
                                        <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-orange-500">
                                            <SelectValue placeholder="Buscar na lista..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {clients.map(client => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name} {client.companyName ? `- ${client.companyName}` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4 md:col-span-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => setHasShipping(!hasShipping)}
                                            className={cn(
                                                "w-10 h-6 rounded-full transition-colors relative",
                                                hasShipping ? "bg-orange-500" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                                hasShipping ? "left-5" : "left-1"
                                            )} />
                                        </button>
                                        <span className="text-sm font-bold text-slate-700">Adicionar Entrega / Frete?</span>
                                    </div>

                                    {hasShipping && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                                            <div className="md:col-span-2 space-y-2">
                                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Endereço de Entrega</Label>
                                                <Input
                                                    placeholder="Ex: Rua das Flores, 123 - Centro"
                                                    value={shippingAddress}
                                                    onChange={(e) => setShippingAddress(e.target.value)}
                                                    className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:border-orange-500 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Valor do Frete (R$)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0,00"
                                                    value={shippingValue || ''}
                                                    onChange={(e) => setShippingValue(parseFloat(e.target.value) || 0)}
                                                    className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:border-orange-500 focus:ring-orange-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
                        <CardHeader className="border-b border-slate-50 pb-6 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Itens do Pedido</CardTitle>
                                <CardDescription>O pedido será enviado direto para produção</CardDescription>
                            </div>
                            <Button onClick={addItem} variant="secondary" className="bg-orange-50 text-orange-600 border-none hover:bg-orange-100 font-bold rounded-xl px-4 h-10 transition-all">
                                <Plus className="mr-2 h-4 w-4" /> Novo Item
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            {items.map((item, index) => {
                                const product = getProduct(item.productId);
                                const isArea = product?.pricingType === 'AREA';

                                return (
                                    <div key={item.id} className="relative group bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50 transition-all hover:bg-white hover:shadow-md hover:border-orange-100">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => removeItem(item.id!)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                            <div className="md:col-span-4 space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Produto</Label>
                                                <Select
                                                    value={item.productId}
                                                    onValueChange={(v) => updateItem(item.id!, 'productId', v)}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-100 h-11 bg-white">
                                                        <SelectValue placeholder="Selecione..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {products.map(p => (
                                                            <SelectItem key={p.id} value={p.id}>
                                                                {p.name} ({p.pricingType === 'AREA' ? `R$ ${p.price}/m²` : `R$ ${p.price} un.`})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {isArea ? (
                                                <div className="md:col-span-4 grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Largura (cm)</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.width || ''}
                                                            onChange={e => updateItem(item.id!, 'width', parseFloat(e.target.value))}
                                                            className="rounded-xl border-slate-100 h-11 bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Altura (cm)</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.height || ''}
                                                            onChange={e => updateItem(item.id!, 'height', parseFloat(e.target.value))}
                                                            className="rounded-xl border-slate-100 h-11 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="md:col-span-4 flex items-center justify-center text-[11px] text-slate-300 font-bold uppercase tracking-widest h-full pt-6">
                                                    Sem dimensões
                                                </div>
                                            )}

                                            <div className="md:col-span-1 space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Qtd</Label>
                                                <Input
                                                    type="number"
                                                    value={item.quantity || ''}
                                                    onChange={e => updateItem(item.id!, 'quantity', parseFloat(e.target.value))}
                                                    className="rounded-xl border-slate-100 h-11 bg-white px-2"
                                                />
                                            </div>

                                            <div className="md:col-span-3 space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">V. Unitário</Label>
                                                <div className="flex flex-col gap-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unitPrice || ''}
                                                        onChange={e => updateItem(item.id!, 'unitPrice', parseFloat(e.target.value))}
                                                        className="rounded-xl border-orange-100 h-11 bg-orange-50/30 text-orange-600 font-bold"
                                                    />
                                                    <ItemCostDialog
                                                        quantity={item.quantity || 1}
                                                        initialCosts={item.costs}
                                                        onApply={(price, costs) => {
                                                            setItems(prev => prev.map(i => i.id === item.id ? { ...i, unitPrice: price, costs: costs, totalPrice: price * (i.quantity || 1) } : i))
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 pt-4 border-t border-slate-100/50">
                                            <div className="md:col-span-9 space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Acabamento / Observações de Produção</Label>
                                                <Input
                                                    placeholder="Ex: Refiling, Ilhós a cada 50cm, Verniz localizado..."
                                                    value={item.finish || ''}
                                                    onChange={e => updateItem(item.id!, 'finish', e.target.value)}
                                                    className="rounded-xl border-slate-100 h-11 bg-white"
                                                />
                                            </div>
                                            <div className="md:col-span-3 flex flex-col items-end justify-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtotal Item</span>
                                                <span className="text-2xl font-black text-slate-800">
                                                    R$ {(item.totalPrice || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none shadow-xl bg-orange-600 rounded-[2.5rem] p-8 text-white sticky top-24 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Printer className="h-40 w-40" />
                        </div>
                        <h3 className="text-xl font-extrabold mb-6 relative z-10">Total do Pedido</h3>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-orange-100 font-bold text-xs uppercase tracking-widest">
                                <span>Itens Totais</span>
                                <span className="text-white">{items.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-orange-100 font-bold text-xs uppercase tracking-widest">
                                <span>Frete</span>
                                <span className={hasShipping ? "text-white" : "text-orange-400"}>
                                    R$ {hasShipping ? shippingValue.toFixed(2) : "0,00"}
                                </span>
                            </div>
                            <div className="h-px bg-white/10 my-4" />
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-orange-100 uppercase tracking-widest">Total Geral</span>
                                <p className="text-5xl font-black text-white">R$ {getTotal().toFixed(2)}</p>
                            </div>

                            <div className="pt-8 space-y-3">
                                <Button onClick={handleSave} className="w-full bg-white text-orange-600 hover:bg-orange-50 font-extrabold rounded-[1.2rem] h-14 text-lg shadow-xl shadow-black/10 transition-all active:scale-95">
                                    CRIAR PEDIDO AGORA
                                </Button>
                                <Button variant="ghost" onClick={() => router.push('/')} className="w-full text-orange-100 hover:text-white hover:bg-white/5 font-bold rounded-xl h-12 transition-all">
                                    Descartar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
