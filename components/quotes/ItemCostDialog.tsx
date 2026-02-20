"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Calculator, Percent, Banknote, PackageOpen, TrendingUp } from "lucide-react"

interface CostItem {
    id: string;
    name: string;
    value: number;
}

interface CostBreakdown {
    taxPercent: number;
    markupPercent: number;
    items: CostItem[];
    shippingCost: number;
}

import { Product } from "@/types"
import { v4 as uuidv4 } from "uuid"
import { Trash, Plus } from "lucide-react"

interface ItemCostDialogProps {
    onApply: (unitPrice: number, costs: CostBreakdown) => void;
    initialCosts?: Partial<CostBreakdown>;
    quantity: number;
    product?: Product;
    currentUnitPrice?: number;
}

export function ItemCostDialog({ onApply, initialCosts, quantity, product, currentUnitPrice }: ItemCostDialogProps) {
    const [open, setOpen] = useState(false)
    const [costs, setCosts] = useState<CostBreakdown>({
        taxPercent: initialCosts?.taxPercent ?? 13,
        markupPercent: initialCosts?.markupPercent ?? 30,
        shippingCost: initialCosts?.shippingCost ?? 0,
        items: initialCosts?.items && initialCosts.items.length > 0 ? initialCosts.items : [
            // Default item if none exists
            { id: 'default-1', name: 'Custo do Material', value: currentUnitPrice || product?.price || 0 }
        ]
    })

    // Reset/Initialize when opening
    useEffect(() => {
        if (open) {
            setCosts({
                taxPercent: initialCosts?.taxPercent ?? 13,
                markupPercent: initialCosts?.markupPercent ?? 30,
                shippingCost: initialCosts?.shippingCost ?? 0,
                // Check if we have saved items, otherwise check for legacy fields or init with base price
                items: initialCosts?.items && initialCosts.items.length > 0
                    ? initialCosts.items
                    : (product ? [{ id: uuidv4(), name: product.name, value: currentUnitPrice || product.price || 0 }] : [])
            })
        }
    }, [open, initialCosts, product, currentUnitPrice])

    const handleItemChange = (id: string, field: 'name' | 'value', val: string | number) => {
        setCosts(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, [field]: val } : item)
        }))
    }

    const addItem = () => {
        setCosts(prev => ({
            ...prev,
            items: [...prev.items, { id: uuidv4(), name: '', value: 0 }]
        }))
    }

    const removeItem = (id: string) => {
        setCosts(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }))
    }

    const calculateResult = () => {
        const itemsTotal = costs.items.reduce((acc, item) => acc + (item.value || 0), 0);

        const totalBaseCost =
            itemsTotal +
            (costs.shippingCost / (quantity || 1));

        const costWithTax = totalBaseCost * (1 + (costs.taxPercent / 100));
        const finalPrice = costWithTax * (1 + (costs.markupPercent / 100));

        return {
            unitCost: costWithTax,
            finalPrice: finalPrice,
            profit: finalPrice - costWithTax
        }
    }

    const result = calculateResult()

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 gap-2 px-4 py-1 h-auto text-xs font-bold uppercase tracking-wide">
                    <Calculator className="h-3.5 w-3.5" /> Composição
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="h-6 w-6 text-orange-500" /> Composição de Custos
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <div className="space-y-6">

                        {/* Dynamic Items List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Banknote className="h-3.5 w-3.5" /> Itens de Custo
                                </Label>
                                <Button onClick={addItem} size="sm" variant="ghost" className="h-6 text-xs text-orange-600 hover:bg-orange-50">
                                    <Plus className="h-3 w-3 mr-1" /> Adicionar
                                </Button>
                            </div>

                            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                                {costs.items.map((item) => (
                                    <div key={item.id} className="flex gap-2 items-center">
                                        <Input
                                            value={item.name}
                                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                            placeholder="Nome do custo (ex: Silk)"
                                            className="h-9 text-xs"
                                        />
                                        <div className="relative w-28 shrink-0">
                                            <span className="absolute left-2 top-2.5 text-slate-400 text-[10px]">R$</span>
                                            <Input
                                                type="number"
                                                value={item.value || ''}
                                                onChange={(e) => handleItemChange(item.id, 'value', parseFloat(e.target.value))}
                                                className="pl-6 h-9 text-xs"
                                            />
                                        </div>
                                        <Button
                                            onClick={() => removeItem(item.id)}
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-slate-300 hover:text-red-500"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {costs.items.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum custo adicionado.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500">Frete Total (Rateado na qtd)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1.5 text-slate-400 text-[10px]">R$</span>
                                    <Input
                                        type="number"
                                        value={costs.shippingCost || ''}
                                        onChange={(e) => setCosts(prev => ({ ...prev, shippingCost: parseFloat(e.target.value) || 0 }))}
                                        className="pl-8 h-8 rounded-lg text-xs border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Imposto (%)</Label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            type="number"
                                            value={costs.taxPercent}
                                            onChange={(e) => setCosts(prev => ({ ...prev, taxPercent: parseFloat(e.target.value) || 0 }))}
                                            className="pl-9 h-9 rounded-xl border-slate-200 bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Margem (%)</Label>
                                    <div className="relative">
                                        <TrendingUp className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            type="number"
                                            value={costs.markupPercent}
                                            onChange={(e) => setCosts(prev => ({ ...prev, markupPercent: parseFloat(e.target.value) || 0 }))}
                                            className="pl-9 h-9 rounded-xl border-orange-200 focus:ring-orange-500 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 flex flex-col justify-center">
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                            <div className="pt-4 border-t border-slate-100/50 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Custo Total (sem margem)</span>
                                    <span className="font-bold text-slate-700">R$ {result.unitCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Lucro Estimado</span>
                                    <span className="font-bold text-green-600">R$ {result.profit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-slate-800">Preço Final Sugerido</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-extrabold text-orange-600">R$ {result.finalPrice.toFixed(2)}</span>
                                        {product?.minPrice && (result.finalPrice * quantity) < product.minPrice && (
                                            <p className="text-[10px] font-bold text-red-500 mt-1">
                                                Abaixo do Mínimo (R$ {product.minPrice.toFixed(2)})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-5 gap-1.5">
                                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(m => (
                                    <Button
                                        key={m}
                                        type="button"
                                        variant={costs.markupPercent === m ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCosts(prev => ({ ...prev, markupPercent: m }))}
                                        className={cn(
                                            "h-7 text-[10px] rounded-lg",
                                            costs.markupPercent === m ? "bg-orange-500" : "hover:border-orange-200"
                                        )}
                                    >
                                        {m}%
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => {
                            onApply(result.finalPrice, costs);
                            setOpen(false);
                        }}
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-12 font-bold"
                    >
                        Aplicar Preço no Orçamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
