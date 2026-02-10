"use client"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAppStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Client } from "@/types"

export function ClientTable() {
    const { clients } = useAppStore()
    const router = useRouter()

    if (clients.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-lg bg-white/5">Nenhum cliente cadastrado.</div>
    }

    return (
        <div className="border rounded-md bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Tipo</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead className="text-right">Origem</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client: Client) => (
                        <TableRow
                            key={client.id}
                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => router.push(`/clients/${client.id}`)}
                        >
                            <TableCell className="font-medium">
                                <Badge variant={client.type === 'PJ' ? 'default' : 'secondary'} className={client.type === 'PJ' ? "bg-orange-500 hover:bg-orange-600" : ""}>
                                    {client.type}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-bold text-slate-700">{client.name}</TableCell>
                            <TableCell>{client.companyName || "-"}</TableCell>
                            <TableCell>
                                <div className="flex flex-col text-xs">
                                    {client.phone && <span className="font-medium">{client.phone}</span>}
                                    {client.email && <span className="text-muted-foreground">{client.email}</span>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-500">{client.origin}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
