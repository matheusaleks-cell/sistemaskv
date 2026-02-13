"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ClientType } from "@/types"

export function ClientDialog() {
    const { addClient } = useAppStore()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [document, setDocument] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [type, setType] = useState<ClientType>("PF")
    const [origin, setOrigin] = useState("Instagram")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Basic validation
        if (!name || !phone) {
            alert("Nome e Telefone são obrigatórios")
            setLoading(false)
            return
        }

        const success = await addClient({
            name,
            companyName,
            document,
            email,
            phone,
            type,
            origin,
        })

        setLoading(false)
        if (success) {
            setOpen(false)
            resetForm()
        } else {
            alert("Erro ao cadastrar cliente no banco de dados. Verifique a conexão.")
        }
    }

    const resetForm = () => {
        setName("")
        setCompanyName("")
        setDocument("")
        setEmail("")
        setPhone("")
        setType("PF")
        setOrigin("Instagram")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Novo Cliente</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Adicionar Cliente</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do cliente. Clique em salvar quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Tipo
                            </Label>
                            <Select value={type} onValueChange={(v) => setType(v as ClientType)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PF">Pessoa Física</SelectItem>
                                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        {type === 'PJ' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="company" className="text-right">
                                    Empresa
                                </Label>
                                <Input
                                    id="company"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="document" className="text-right">
                                CPF/CNPJ
                            </Label>
                            <Input
                                id="document"
                                value={document}
                                onChange={(e) => setDocument(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Telefone
                            </Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="origin" className="text-right">
                                Origem
                            </Label>
                            <Select value={origin} onValueChange={setOrigin}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Origem" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                    <SelectItem value="Indicacao">Indicação</SelectItem>
                                    <SelectItem value="Google">Google</SelectItem>
                                    <SelectItem value="Balcao">Balcão</SelectItem>
                                    <SelectItem value="Site">Site</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>Salvar Cliente</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
