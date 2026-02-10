"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ArrowLeft,
    Plus,
    Search,
    Calendar,
    ArrowDownCircle,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    Filter
} from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

export default function PayablePage() {
    const router = useRouter()
    const { financialRecords, addFinancialRecord, updateFinancialStatus } = useAppStore()
    const [isAdding, setIsAdding] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const payables = financialRecords.filter(r => r.type === 'PAYABLE')
    const filteredPayables = payables.filter(r =>
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const [newRecord, setNewRecord] = useState({
        description: "",
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        category: "Suplementos"
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addFinancialRecord({
            ...newRecord,
            type: 'PAYABLE',
            status: 'PENDING'
        })
        setIsAdding(false)
        setNewRecord({
            description: "",
            amount: 0,
            dueDate: new Date().toISOString().split('T')[0],
            category: "Suplementos"
        })
    }

    const totalPending = payables
        .filter(r => r.status === 'PENDING')
        .reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="p-0 hover:bg-transparent text-slate-500 hover:text-orange-500 mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                            <ArrowDownCircle className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Contas a Pagar</h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="bg-red-50 px-6 py-2 rounded-2xl border border-red-100 flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-red-400">Total Pendente</span>
                        <span className="text-xl font-black text-red-600">
                            {totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-14 px-8 font-bold shadow-lg"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nova Conta
                    </Button>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 rounded-xl border-slate-200 bg-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-xl border-slate-200">
                            <Filter className="mr-2 h-4 w-4" /> Filtros
                        </Button>
                        <Button variant="outline" className="rounded-xl border-slate-200">
                            <Calendar className="mr-2 h-4 w-4" /> Este Mês
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Descrição</th>
                                <th className="px-8 py-4">Categoria</th>
                                <th className="px-8 py-4">Vencimento</th>
                                <th className="px-8 py-4 text-right">Valor</th>
                                <th className="px-8 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredPayables.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-20 text-center text-slate-400">
                                        Nenhuma conta a pagar encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayables.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-4">
                                            {record.status === 'PAID' ? (
                                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit text-xs font-bold ring-1 ring-green-100">
                                                    <CheckCircle2 className="h-3 w-3" /> Pago
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit text-xs font-bold ring-1 ring-amber-100">
                                                    <Clock className="h-3 w-3" /> Pendente
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm font-bold text-slate-700">{record.description}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{record.category}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm text-slate-500 font-medium">{format(new Date(record.dueDate), 'dd/MM/yyyy')}</span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <span className="text-base font-bold text-slate-800">
                                                {record.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {record.status === 'PENDING' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => updateFinancialStatus(record.id, 'PAID', new Date().toISOString())}
                                                        className="bg-green-600 hover:bg-green-700 h-8 rounded-lg text-[10px] font-bold"
                                                    >
                                                        BAIXAR
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Adição (Simulado) */}
            {isAdding && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900">Nova Conta a Pagar</h2>
                            <p className="text-slate-500 text-sm">Preencha os dados da conta.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Input
                                    required
                                    placeholder="Ex: Fornecedor de Camisetas"
                                    value={newRecord.description}
                                    onChange={e => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Valor</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                                        <Input
                                            type="number"
                                            required
                                            value={newRecord.amount}
                                            onChange={e => setNewRecord(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                            className="pl-10 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Vencimento</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={newRecord.dueDate}
                                        onChange={e => setNewRecord(prev => ({ ...prev, dueDate: e.target.value }))}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Input
                                    placeholder="Ex: Produção, Fixos..."
                                    value={newRecord.category}
                                    onChange={e => setNewRecord(prev => ({ ...prev, category: e.target.value }))}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="flex-1 rounded-xl">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">
                                    Salvar Conta
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
