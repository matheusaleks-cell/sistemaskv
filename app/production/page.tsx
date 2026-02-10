"use client"

import { useState } from "react"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { ProductionList } from "@/components/production/ProductionList"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"

export default function ProductionPage() {
    const { currentUser } = useAppStore()
    const [view, setView] = useState<'KANBAN' | 'LIST'>('LIST')

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Linha de Produção</h1>
                    <p className="text-muted-foreground">Gerencie o fluxo de trabalho da sua gráfica.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <Button
                        variant={view === 'KANBAN' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('KANBAN')}
                        className={view === 'KANBAN' ? 'bg-white shadow-sm' : 'text-slate-500'}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
                    </Button>
                    <Button
                        variant={view === 'LIST' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('LIST')}
                        className={view === 'LIST' ? 'bg-white shadow-sm' : 'text-slate-500'}
                    >
                        <List className="h-4 w-4 mr-2" /> Lista
                    </Button>
                </div>
            </div>

            <div className="flex-1">
                {view === 'KANBAN' ? <KanbanBoard /> : <ProductionList />}
            </div>
        </div>
    )
}
