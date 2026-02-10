"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { UserMenu } from "./UserMenu"

export function Header() {
    const pathname = usePathname()
    const { currentUser, clients, orders } = useAppStore()

    const getBreadcrumbs = () => {
        const paths = pathname.split('/').filter(p => p);
        if (paths.length === 0) return 'Dashboard';

        return paths.map((p, i) => {
            const isLast = i === paths.length - 1;

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
                <div className="relative hidden md:flex items-center bg-white rounded-full shadow-sm border border-slate-100 overflow-hidden w-96 pl-4 pr-1 h-12">
                    <input
                        placeholder="Buscar pedido, cliente..."
                        className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                    />
                    <Button size="icon" className="h-9 w-9 rounded-full bg-orange-500 hover:bg-orange-600 shadow-sm">
                        <Search className="h-4 w-4 text-white" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-orange-500 hover:bg-white rounded-full h-11 w-11 transition-all shadow-sm bg-white">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </Button>
                    <UserMenu />
                </div>
            </div>
        </header>
    )
}
