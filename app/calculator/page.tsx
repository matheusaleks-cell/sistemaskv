"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, ArrowLeft, Download, Percent, Banknote, PackageOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CalculatorPage() {
    const router = useRouter()
    const [values, setValues] = useState({
        taxPercent: 13,
        itemCost: 0,
        engravingCost: 0,
        tshirtCost: 0,
        silkCost: 0,
        collarCost: 0,
        sewingCost: 0,
        bagCost: 0,
        shippingCost: 0,
        quantity: 1
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setValues(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }))
    }

    const results = useMemo(() => {
        const totalBaseCost =
            values.itemCost +
            values.engravingCost +
            values.tshirtCost +
            values.silkCost +
            values.collarCost +
            values.sewingCost +
            values.bagCost +
            (values.shippingCost / (values.quantity || 1));

        // Cost including tax
        // If tax is 13%, the cost is divided by (1 - 0.13) to account for tax on the final price, 
        // but the user said "Custo imposto 13%", which usually means adding 13% to the base.
        // I'll assume it's a simple addition for "cost calculation".
        const costWithTax = totalBaseCost * (1 + (values.taxPercent / 100));

        const markups = [];
        for (let i = 5; i <= 100; i += 5) {
            const price = costWithTax * (1 + (i / 100));
            markups.push({
                percent: i,
                price: price,
                profit: price - costWithTax
            });
        }

        return {
            unitCost: costWithTax,
            totalCost: costWithTax * values.quantity,
            markups
        }
    }, [values])

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="p-0 hover:bg-transparent text-slate-500 hover:text-orange-500 mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
                    </Button>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Calculadora de Custos</h1>
                    <p className="text-slate-500">Alimente as informações para calcular o custo real e margens de lucro.</p>
                </div>
                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-6">
                    <Download className="mr-2 h-4 w-4" /> Exportar PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold">Imposto (%)</Label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        name="taxPercent"
                                        type="number"
                                        value={values.taxPercent}
                                        onChange={handleChange}
                                        className="pl-10 h-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold">Quantidade Total</Label>
                                <div className="relative">
                                    <PackageOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        name="quantity"
                                        type="number"
                                        value={values.quantity}
                                        onChange={handleChange}
                                        className="pl-10 h-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-8">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                                <Banknote className="mr-2 h-5 w-5 text-green-500" /> Detalhamento de Custos (Unitário)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Custo Brinde', name: 'itemCost' },
                                    { label: 'Custo Gravação', name: 'engravingCost' },
                                    { label: 'Custo Camiseta', name: 'tshirtCost' },
                                    { label: 'Custo Silk', name: 'silkCost' },
                                    { label: 'Custo Gola', name: 'collarCost' },
                                    { label: 'Costura', name: 'sewingCost' },
                                    { label: 'Custo Saquinho', name: 'bagCost' },
                                    { label: 'Frete Total', name: 'shippingCost' },
                                ].map((field) => (
                                    <div key={field.name} className="space-y-2">
                                        <Label className="text-slate-500 text-sm">{field.label}</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                                            <Input
                                                name={field.name}
                                                type="number"
                                                value={(values as any)[field.name]}
                                                onChange={handleChange}
                                                className="pl-10 h-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="space-y-6">
                    <div className="bg-orange-600 rounded-[2rem] p-8 text-white shadow-xl shadow-orange-200 flex flex-col items-center text-center">
                        <Calculator className="h-12 w-12 mb-4 opacity-80" />
                        <span className="text-orange-100 uppercase tracking-widest text-xs font-bold mb-1">Custo Final Unitário</span>
                        <h2 className="text-4xl font-black mb-6">
                            {results.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h2>
                        <div className="w-full h-px bg-white/20 mb-6" />
                        <div className="grid grid-cols-2 w-full gap-4">
                            <div>
                                <span className="text-orange-100 text-[10px] uppercase font-bold block mb-1">Quantidade</span>
                                <span className="text-xl font-bold">{values.quantity}</span>
                            </div>
                            <div>
                                <span className="text-orange-100 text-[10px] uppercase font-bold block mb-1">Custo Total</span>
                                <span className="text-xl font-bold">
                                    {results.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-fit">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Escala de Lucro (%)</h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {results.markups.map((m) => (
                                <div key={m.percent} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                            {m.percent}%
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 font-medium">Preço sugerido</span>
                                            <span className="text-sm font-bold text-slate-700">
                                                {m.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-green-500 font-bold block">Lucro</span>
                                        <span className="text-sm font-bold text-green-600">
                                            +{m.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
