"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { ProductDialog } from "./ProductDialog"

export function ProductTable() {
    const { products, deleteProduct } = useAppStore()

    if (products.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-lg bg-white/5">Nenhum produto cadastrado.</div>
    }

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
            deleteProduct(id)
        }
    }

    return (
        <div className="border rounded-md bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome do Produto</TableHead>
                        <TableHead>Preço Base</TableHead>
                        <TableHead>Prazo Padrão</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">
                                <div>{product.name}</div>
                                <div className="text-xs text-muted-foreground">{product.category}</div>
                            </TableCell>
                            <TableCell>
                                {product.pricingType === 'AREA'
                                    ? `R$ ${product.price.toFixed(2)} /m²`
                                    : `R$ ${product.price.toFixed(2)} un.`}
                            </TableCell>
                            <TableCell>{product.defaultDays} dias</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <ProductDialog
                                        product={product}
                                        trigger={
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        }
                                    />

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(product.id, product.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
