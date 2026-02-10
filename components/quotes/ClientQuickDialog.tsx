"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { UserPlus } from "lucide-react"

interface ClientQuickDialogProps {
    onClientCreated?: (clientId: string) => void;
}

export function ClientQuickDialog({ onClientCreated }: ClientQuickDialogProps) {
    const [open, setOpen] = useState(false)
    const { addClient } = useAppStore()

    const [name, setName] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [document, setDocument] = useState("")
    const [type, setType] = useState<'PF' | 'PJ'>('PF')
    const [origin, setOrigin] = useState("WhatsApp")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !phone) {
            alert("Nome e Telefone são obrigatórios")
            return
        }

        addClient({
            name,
            companyName: type === 'PJ' ? companyName : undefined,
            document,
            phone,
            email,
            type,
            origin,
        })

        // Reset and close
        setName("")
        setCompanyName("")
        setPhone("")
        setEmail("")
        setDocument("")
        setType('PF')
        setOrigin("WhatsApp")
        setOpen(false)

        alert("Cliente cadastrado com sucesso! Selecione-o na lista.")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 font-bold rounded-xl h-9">
                    <UserPlus className="mr-2 h-4 w-4" /> Novo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Cadastro de Cliente</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Type Toggle */}
                        <div className="space-y-3 md:col-span-2">
                            <Label className="text-sm font-bold text-slate-700">Tipo de Cliente</Label>
                            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                                <button
                                    type="button"
                                    onClick={() => setType('PF')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'PF' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Pessoa Física
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('PJ')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'PJ' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Pessoa Jurídica
                                </button>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-slate-700">
                                {type === 'PF' ? 'Nome Completo' : 'Responsável'}
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ex: João da Silva"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="rounded-xl h-11"
                            />
                        </div>

                        {/* Document */}
                        <div className="space-y-2">
                            <Label htmlFor="document" className="text-sm font-bold text-slate-700 text-slate-400">
                                {type === 'PF' ? 'CPF' : 'CNPJ'} (Opcional)
                            </Label>
                            <Input
                                id="document"
                                placeholder={type === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                                value={document}
                                onChange={e => setDocument(e.target.value)}
                                className="rounded-xl h-11"
                            />
                        </div>

                        {/* Company Name (for PJ only) */}
                        {type === 'PJ' && (
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="companyName" className="text-sm font-bold text-slate-700">Razão Social / Nome Fantasia</Label>
                                <Input
                                    id="companyName"
                                    placeholder="Ex: Minha Empresa LTDA"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    className="rounded-xl h-11"
                                />
                            </div>
                        )}

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-bold text-slate-700">Telefone / WhatsApp</Label>
                            <Input
                                id="phone"
                                placeholder="(11) 99999-9999"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="rounded-xl h-11"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-slate-700 text-slate-400">E-mail (Opcional)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="cliente@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="rounded-xl h-11"
                            />
                        </div>

                        {/* Origin Select */}
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm font-bold text-slate-700">Como nos conheceu?</Label>
                            <select
                                value={origin}
                                onChange={e => setOrigin(e.target.value)}
                                className="w-full rounded-xl h-11 px-3 border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-sm"
                            >
                                <option value="WhatsApp">WhatsApp / Chat</option>
                                <option value="Instagram">Instagram / Redes Sociais</option>
                                <option value="Indicação">Indicação</option>
                                <option value="Antigo">Já era cliente</option>
                                <option value="Anúncio">Anúncio (Google/Meta)</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold rounded-xl h-12 shadow-lg shadow-orange-500/20">
                            Cadastrar Cliente
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
