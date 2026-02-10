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
import { format } from "date-fns"

export function AuditLogTable() {
    const { logs } = useAppStore()

    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedLogs.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-lg bg-white/5">Nenhum registro de auditoria encontrado.</div>
    }

    return (
        <div className="border rounded-md bg-white max-h-[500px] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">Data/Hora</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Detalhes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className="text-xs text-muted-foreground">
                                {format(new Date(log.date), "dd/MM/yyyy HH:mm:ss")}
                            </TableCell>
                            <TableCell className="font-medium">{log.userName}</TableCell>
                            <TableCell>
                                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">{log.action}</span>
                            </TableCell>
                            <TableCell className="text-sm">{log.details}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
