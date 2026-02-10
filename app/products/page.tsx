"use client"

import { ProductTable } from "@/components/products/ProductTable";
import { ProductDialog } from "@/components/products/ProductDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductsPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Catálogo de Produtos</h2>
                    <p className="text-muted-foreground">
                        Gerencie os itens disponíveis para venda e produção.
                    </p>
                </div>
                <ProductDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Produtos Cadastrados</CardTitle>
                    <CardDescription>
                        Lista de todos os produtos ativos no sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductTable />
                </CardContent>
            </Card>
        </div>
    )
}
