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

export function ProductDialog() {
    const { addProduct, currentUser } = useAppStore()
    const [open, setOpen] = useState(false)

    // Allow both MASTER and ATTENDANT to add products, as requested.
    if (!currentUser) return null;

    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [minPrice, setMinPrice] = useState("")
    const [defaultDays, setDefaultDays] = useState("")
    const [category, setCategory] = useState<any>('BANNER')
    const [pricingType, setPricingType] = useState<any>('AREA')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !price || !defaultDays) return

        addProduct({
            name,
            price: parseFloat(price),
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            defaultDays: parseInt(defaultDays),
            category,
            pricingType
        })

        setOpen(false)
        setName("")
        setPrice("")
        setMinPrice("")
        setDefaultDays("")
        setCategory("BANNER")
        setPricingType("AREA")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Novo Produto</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Adicionar Produto</DialogTitle>
                        <DialogDescription>
                            Defina as regras de precificação e categoria do produto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nome</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Categoria</Label>
                            <select
                                id="category"
                                className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={category}
                                onChange={(e) => setCategory(e.target.value as any)}
                            >
                                <option value="BANNER">Lonas e Faixas</option>
                                <option value="STICKER">Adesivos</option>
                                <option value="CLOTHING">Confecção</option>
                                <option value="GIFTS">Brindes</option>
                                <option value="OTHER">Outros</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pricingType" className="text-right">Cobrança</Label>
                            <div className="col-span-3 flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="pricingType"
                                        value="AREA"
                                        checked={pricingType === 'AREA'}
                                        onChange={() => setPricingType('AREA')}
                                    />
                                    Por m²
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="pricingType"
                                        value="FIXED"
                                        checked={pricingType === 'FIXED'}
                                        onChange={() => setPricingType('FIXED')}
                                    />
                                    Preço Fixo (Un)
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                {pricingType === 'AREA' ? 'Preço m² (R$)' : 'Preço Unit. (R$)'}
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="minPrice" className="text-right">Mínimo (R$)</Label>
                            <Input
                                id="minPrice"
                                type="number"
                                step="0.01"
                                placeholder="Opcional"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="days" className="text-right">Prazo (Dias)</Label>
                            <Input
                                id="days"
                                type="number"
                                value={defaultDays}
                                onChange={(e) => setDefaultDays(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Salvar Produto</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
