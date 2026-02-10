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

export function ProductTable() {
    const { products } = useAppStore()

    if (products.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-lg bg-white/5">Nenhum produto cadastrado.</div>
    }

    return (
        <div className="border rounded-md bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome do Produto</TableHead>
                        <TableHead>Preço Base</TableHead>
                        <TableHead className="text-right">Prazo Padrão (Dias)</TableHead>
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
                            <TableCell className="text-right">{product.defaultDays} dias</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
