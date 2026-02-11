"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Bell, Search, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { UserMenu } from "./UserMenu"
import { format } from "date-fns"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const { currentUser, clients, orders } = useAppStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    const getBreadcrumbs = () => {
        const paths = pathname.split('/').filter(p => p);
        if (paths.length === 0) return 'Dashboard';

        return paths.map((p, i) => {
            // Simple mapping for common routes
            const map: Record<string, string> = {
                'quotes': 'Orçamentos',
                'products': 'Produtos',
                'clients': 'Clientes',
                'production': 'Produção',
                'financial': 'Financeiro',
                'settings': 'Configurações',
                'new': 'Novo'
            };

            // Dynamic ID resolution
            if (i > 0) {
                const parent = paths[i - 1];
                if (parent === 'clients') {
                    const client = clients.find(c => c.id === p);
                    if (client) return client.name;
                }
                if (parent === 'quotes') {
                    const order = orders.find(o => o.id === p);
                    if (order) return `Pedido #${order.osNumber || order.id.slice(0, 8).toUpperCase()}`;
                }
            }

            return map[p] || (p.charAt(0).toUpperCase() + p.slice(1));
        }).join(' > ');
    }

    const filteredClients = searchQuery.length > 1
        ? clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
        : []

    const filteredOrders = searchQuery.length > 1
        ? orders.filter(o =>
            o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.osNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3)
        : []

    const recentLogs = [...(useAppStore.getState().logs || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

    return (
        <header className="h-20 bg-transparent sticky top-0 z-30 px-10 flex items-center justify-between">
            <div className="flex items-center text-sm font-semibold text-slate-400">
                <div className="flex items-baseline gap-0.5 mr-2">
                    <span className="text-orange-600 font-black italic tracking-tighter text-lg">SKV</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-900"></div>
                </div>
                <ChevronRight className="h-4 w-4 mx-2 opacity-50" />
                <span className="text-orange-500 font-bold">{getBreadcrumbs()}</span>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:flex flex-col group">
                    <div className="flex items-center bg-white rounded-full shadow-sm border border-slate-100 overflow-hidden w-96 pl-4 pr-1 h-12 focus-within:border-orange-300 transition-all">
                        <input
                            placeholder="Buscar pedido, cliente..."
                            className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setIsSearchOpen(true)
                            }}
                            onFocus={() => setIsSearchOpen(true)}
                        />
                        <Button size="icon" className="h-9 w-9 rounded-full bg-orange-500 hover:bg-orange-600 shadow-sm">
                            <Search className="h-4 w-4 text-white" />
                        </Button>
                    </div>

                    {isSearchOpen && (filteredClients.length > 0 || filteredOrders.length > 0) && (
                        <div className="absolute top-14 left-0 w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {filteredClients.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Clientes</p>
                                    {filteredClients.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => { router.push(`/clients/${c.id}`); setIsSearchOpen(false); setSearchQuery(""); }}
                                            className="w-full text-left px-3 py-2 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all"
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {filteredOrders.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Pedidos / OS</p>
                                    {filteredOrders.map(o => (
                                        <button
                                            key={o.id}
                                            onClick={() => { router.push(`/quotes/${o.id}`); setIsSearchOpen(false); setSearchQuery(""); }}
                                            className="w-full text-left px-3 py-2 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all flex justify-between"
                                        >
                                            <span>{o.clientName}</span>
                                            <span className="text-[10px] font-mono opacity-50">{o.osNumber || o.id.slice(0, 8)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {isSearchOpen && searchQuery.length > 1 && filteredClients.length === 0 && filteredOrders.length === 0 && (
                        <div className="absolute top-14 left-0 w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 text-center text-sm text-slate-400">
                            Nenhum resultado encontrado para "{searchQuery}"
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-orange-500 hover:bg-white rounded-full h-11 w-11 transition-all shadow-sm bg-white">
                                <Bell className="h-5 w-5" />
                                {recentLogs.length > 0 && (
                                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 rounded-3xl shadow-2xl border-slate-100 overflow-hidden" align="end" sideOffset={12}>
                            <div className="bg-slate-50 p-4 border-b border-slate-100">
                                <p className="text-sm font-black text-slate-800">Atividades Recentes</p>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {recentLogs.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-400">Sem notificações no momento</div>
                                ) : recentLogs.map((log: any) => (
                                    <div key={log.id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 leading-tight mb-1">{log.details}</p>
                                                <p className="text-[10px] text-slate-400">{format(new Date(log.date), "dd/MM 'às' HH:mm")}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {currentUser?.role === 'MASTER' && (
                                <button
                                    onClick={() => router.push('/logs')}
                                    className="w-full py-3 bg-white hover:bg-slate-50 text-xs font-black text-orange-500 uppercase tracking-widest border-t border-slate-100"
                                >
                                    Ver todos os logs
                                </button>
                            )}
                        </PopoverContent>
                    </Popover>
                    <UserMenu />
                </div>
                {isSearchOpen && (
                    <div className="fixed inset-0 z-40 bg-black/0" onClick={() => setIsSearchOpen(false)}></div>
                )}
            </div>
        </header>
    )
}
