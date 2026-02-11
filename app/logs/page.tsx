"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ClipboardList, ShieldAlert } from "lucide-react"

export default function LogsPage() {
    const { logs, currentUser } = useAppStore()

    if (currentUser?.role !== 'MASTER') {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full space-y-4">
                <ShieldAlert className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-bold">Acesso Negado</h2>
                <p className="text-muted-foreground">Esta área é restrita para administradores Master.</p>
            </div>
        )
    }

    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Logs de Sistema</h2>
                <p className="text-muted-foreground">
                    Acompanhe todas as ações realizadas pelos usuários no sistema.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-orange-500" />
                        Atividades Recentes
                    </CardTitle>
                    <CardDescription>
                        Registro detalhado de alterações e operações.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="w-[180px]">Data/Hora</TableHead>
                                    <TableHead className="w-[120px]">Usuário</TableHead>
                                    <TableHead className="w-[150px]">Ação</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum log registrado ainda.</TableCell>
                                    </TableRow>
                                ) : sortedLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs font-medium">
                                            {format(new Date(log.date), "dd/MM/yyyy HH:mm:ss")}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-slate-700">{log.userName}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded text-slate-600">
                                                {log.action}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600 italic">
                                            {log.details}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
