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
// Separator is available if needed for visual breaks
// import { Separator } from "@/components/ui/separator"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
    Trash, Plus, Calculator, Building2,
    Fingerprint,
    Search,
    Clock,
    FileText,
    AlertTriangle,
    Truck,
    Car,
    Bike,
    Palette
} from "lucide-react"
import { cn } from "@/lib/utils"
import { OrderItem } from "@/types"
import { v4 as uuidv4 } from "uuid"
import { ClientQuickDialog } from "@/components/quotes/ClientQuickDialog"
import { ItemCostDialog } from "@/components/quotes/ItemCostDialog"

export default function NewQuotePage() {
    const router = useRouter()
    const { clients, products, addOrder } = useAppStore()

    const [clientId, setClientId] = useState("")
    const [hasShipping, setHasShipping] = useState(false)
    const [shippingAddress, setShippingAddress] = useState("")
    const [shippingType, setShippingType] = useState("CAR")
    const [shippingValue, setShippingValue] = useState(0)
    const [needsArt, setNeedsArt] = useState(true)
    const [showPrintDialog, setShowPrintDialog] = useState(false)
    const [savedOrderId, setSavedOrderId] = useState<string | null>(null)

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
                itemCost: product.pricingType === 'FIXED' ? product.price * 0.4 : 0 // Default 40% cost for fixed items
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

                    // Always enforce minimum price even on manual unit price edits for area products
                    if (product?.minPrice && calcTotal < product.minPrice) {
                        updated.totalPrice = product.minPrice;
                    } else {
                        updated.totalPrice = Number(calcTotal.toFixed(2));
                    }
                }
                // If it's a field inside costs, handle specialized update
                else if (field === 'costs') {
                    const calcTotal = (updated.unitPrice || 0) * (updated.quantity || 1);
                    updated.totalPrice = Number(calcTotal.toFixed(2));
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

    const handleSave = async () => {
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

            // Validation for Area items
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

        const success = await addOrder({
            clientId: client.id,
            clientName: client.name,
            items: validItems,
            total: getTotal(),
            status: needsArt ? 'QUOTE' : 'APPROVED', // Skip art if not needed (logic to be refined manually if needed/approved)
            hasShipping,
            shippingAddress,
            shippingType,
            shippingValue: hasShipping ? shippingValue : 0,
            needsArt
        });

        if (success && success.order) {
            setSavedOrderId(success.order.id)
            setShowPrintDialog(true)
        } else {
            alert("Erro ao salvar o pedido no banco de dados.");
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-sm mb-2">
                        <Calculator className="h-4 w-4" /> Ferramenta de Custos Integrada
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Novo Orçamento</h2>
                    <p className="text-slate-400 font-medium mt-1">Configure o pedido e gere o PDF para o cliente.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/quotes')} className="rounded-2xl h-12 px-6 font-bold border-slate-200">Cancelar</Button>
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
                            <ClientQuickDialog onClientCreated={(id) => setClientId(id)} />
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
                                <div className="space-y-4 md:col-span-1 pt-6">
                                    <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
                                            <Palette className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor="needs-art" className="text-sm font-bold text-slate-700 cursor-pointer">
                                                Cliente precisa de arte?
                                            </Label>
                                            <p className="text-[10px] text-slate-400">Se não, avança para produção</p>
                                        </div>
                                        <Switch
                                            id="needs-art"
                                            checked={needsArt}
                                            onCheckedChange={setNeedsArt}
                                        />
                                    </div>
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
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-300 pt-2">
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
                                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Tipo</Label>
                                                <Select value={shippingType} onValueChange={setShippingType}>
                                                    <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="CAR"><div className="flex items-center gap-2"><Car className="h-4 w-4" /> Carro</div></SelectItem>
                                                        <SelectItem value="MOTO"><div className="flex items-center gap-2"><Bike className="h-4 w-4" /> Moto</div></SelectItem>
                                                        <SelectItem value="TRUCK"><div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Caminhão</div></SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Valor (R$)</Label>
                                                <Input
                                                    type="number"
                                                    disabled={!shippingAddress}
                                                    placeholder="0,00"
                                                    value={shippingValue || ''}
                                                    onChange={(e) => setShippingValue(parseFloat(e.target.value) || 0)}
                                                    className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <CardDescription>Adicione os produtos e especificações</CardDescription>
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
                                                {product && (
                                                    <p className="text-[10px] font-bold text-orange-500/80 px-1">
                                                        {product.minPrice ? `MÍNIMO GARANTIDO: R$ ${product.minPrice.toFixed(2)}` : 'PREÇO FIXO'}
                                                    </p>
                                                )}
                                            </div>

                                            {isArea ? (
                                                <div className="md:col-span-3 grid grid-cols-2 gap-3">
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
                                                <div className="md:col-span-3 flex items-center justify-center text-[11px] text-slate-300 font-bold uppercase tracking-widest h-full pt-6">
                                                    Sem dimensões
                                                </div>
                                            )}

                                            <div className="md:col-span-2 space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Qtd</Label>
                                                <Input
                                                    type="number"
                                                    value={item.quantity || ''}
                                                    onChange={e => updateItem(item.id!, 'quantity', parseFloat(e.target.value))}
                                                    className="rounded-xl border-slate-300 h-11 bg-white px-2 font-bold text-center text-lg focus:border-orange-500 focus:ring-orange-500 w-full min-w-[80px]"
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
                                            <div className="md:col-span-9 space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Acabamento / Observações de Produção</Label>
                                                <Input
                                                    placeholder="Ex: Refiling, Ilhós a cada 50cm, Verniz localizado..."
                                                    value={item.finish || ''}
                                                    onChange={e => updateItem(item.id!, 'finish', e.target.value)}
                                                    className="rounded-xl border-slate-100 h-11 bg-white"
                                                />
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {["Refile", "Ilhós (4)", "Ilhós (50cm)", "Bainha", "Brilho", "Fosco", "Recorte"].map(tag => (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => {
                                                                const current = item.finish || "";
                                                                const newValue = current ? `${current}, ${tag}` : tag;
                                                                updateItem(item.id!, 'finish', newValue);
                                                            }}
                                                            className="text-[10px] font-bold bg-slate-100 hover:bg-orange-100 hover:text-orange-600 text-slate-500 px-2 py-1 rounded-lg transition-all"
                                                        >
                                                            + {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:col-span-3 flex flex-col items-end justify-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subtotal Item</span>
                                                <span className={cn(
                                                    "text-2xl font-black transition-colors",
                                                    (item.totalPrice || 0) < 5 && (item.totalPrice || 0) > 0 ? "text-red-500 animate-pulse" : "text-slate-800"
                                                )}>
                                                    R$ {(item.totalPrice || 0).toFixed(2)}
                                                </span>
                                                {(item.totalPrice || 0) < 5 && (item.totalPrice || 0) > 0 && (
                                                    <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1">
                                                        <AlertTriangle className="h-2.5 w-2.5" /> Valor muito baixo!
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none shadow-xl bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-24 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Calculator className="h-40 w-40" />
                        </div>
                        <h3 className="text-xl font-extrabold mb-6 relative z-10">Resumo Final</h3>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                                <span>Itens Totais</span>
                                <span className="text-white">{items.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                                <span>Frete</span>
                                <span className={hasShipping ? "text-white" : "text-slate-600"}>
                                    R$ {hasShipping ? shippingValue.toFixed(2) : "0,00"}
                                </span>
                            </div>
                            <div className="h-px bg-white/10 my-4" />
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Total do Orçamento</span>
                                <p className="text-5xl font-black text-white">R$ {getTotal().toFixed(2)}</p>
                            </div>

                            <div className="pt-8 space-y-3">
                                <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-[1.2rem] h-14 text-lg shadow-xl shadow-orange-500/20">
                                    Finalizar Pedido
                                </Button>
                                <Button variant="ghost" onClick={() => router.push('/quotes')} className="w-full text-slate-400 hover:text-white hover:bg-white/5 font-bold rounded-xl h-12 transition-all">
                                    Descartar
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100 flex items-start gap-4">
                        <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                            <Calculator className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-orange-900 text-sm">Cálculo Automático</h4>
                            <p className="text-orange-700/70 text-xs mt-1 leading-relaxed">
                                O sistema aplica o valor por m² mas garante um faturamento mínimo por item para garantir a viabilidade da produção.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <FileText className="h-6 w-6 text-orange-500" /> Pedido Concluído!
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            O pedido foi salvo com sucesso. Deseja imprimir o orçamento agora?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:justify-center">
                        <Button
                            variant="secondary"
                            onClick={() => router.push('/quotes')}
                            className="flex-1 rounded-xl h-12 font-bold"
                        >
                            Não, voltar
                        </Button>
                        <Button
                            onClick={() => router.push(`/quotes/${savedOrderId}/print`)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 font-bold shadow-lg shadow-orange-500/20"
                        >
                            Sim, Imprimir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
