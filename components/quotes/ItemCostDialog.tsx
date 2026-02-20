"use client"

import { useState } from "react"
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

interface CostBreakdown {
    taxPercent: number;
    itemCost: number;
    engravingCost: number;
    tshirtCost: number;
    silkCost: number;
    collarCost: number;
    sewingCost: number;
    bagCost: number;
    otherCost: number;
    shippingCost: number;
    markupPercent: number;
}

import { Product } from "@/types"

interface ItemCostDialogProps {
    onApply: (unitPrice: number, costs: CostBreakdown) => void;
    initialCosts?: Partial<CostBreakdown>;
    quantity: number;
    product?: Product;
}

export function ItemCostDialog({ onApply, initialCosts, quantity, product }: ItemCostDialogProps) {
    const [open, setOpen] = useState(false)
    const [costs, setCosts] = useState<CostBreakdown>({
        taxPercent: initialCosts?.taxPercent ?? 13,
        itemCost: initialCosts?.itemCost ?? 0,
        engravingCost: initialCosts?.engravingCost ?? 0,
        tshirtCost: initialCosts?.tshirtCost ?? 0,
        silkCost: initialCosts?.silkCost ?? 0,
        collarCost: initialCosts?.collarCost ?? 0,
        sewingCost: initialCosts?.sewingCost ?? 0,
        bagCost: initialCosts?.bagCost ?? 0,
        otherCost: initialCosts?.otherCost ?? 0,
        shippingCost: initialCosts?.shippingCost ?? 0,
        markupPercent: initialCosts?.markupPercent ?? 30,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCosts(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }))
    }

    const calculateResult = () => {
        const totalBaseCost =
            costs.itemCost +
            costs.engravingCost +
            costs.tshirtCost +
            costs.silkCost +
            costs.collarCost +
            costs.sewingCost +
            costs.sewingCost +
            costs.bagCost +
            costs.otherCost +
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
                    <Calculator className="h-3.5 w-3.5" /> Composição de Custo
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="h-6 w-6 text-orange-500" /> Calculadora de Item
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Imposto (%)</Label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        name="taxPercent"
                                        type="number"
                                        value={costs.taxPercent}
                                        onChange={handleChange}
                                        className="pl-9 h-9 rounded-xl border-slate-200 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Margem (%)</Label>
                                <div className="relative">
                                    <TrendingUp className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        name="markupPercent"
                                        type="number"
                                        value={costs.markupPercent}
                                        onChange={handleChange}
                                        className="pl-9 h-9 rounded-xl border-orange-200 focus:ring-orange-500 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Banknote className="h-3.5 w-3.5" /> Custos Diretos
                            </Label>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                {[
                                    { label: 'Brinde', name: 'itemCost' },
                                    { label: 'Gravação', name: 'engravingCost' },
                                    { label: 'Camiseta', name: 'tshirtCost' },
                                    { label: 'Silk', name: 'silkCost' },
                                    { label: 'Gola', name: 'collarCost' },
                                    { label: 'Costura', name: 'sewingCost' },
                                    { label: 'Saquinho', name: 'bagCost' },
                                    { label: 'Outros Custos', name: 'otherCost' },
                                    { label: 'Frete Total', name: 'shippingCost' },
                                ].map((field) => (
                                    <div key={field.name} className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-slate-500">{field.label}</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1.5 text-slate-400 text-[10px]">R$</span>
                                            <Input
                                                name={field.name}
                                                type="number"
                                                value={(costs as any)[field.name]}
                                                onChange={handleChange}
                                                className="pl-8 h-8 rounded-lg text-xs border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>
                                ))}
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
