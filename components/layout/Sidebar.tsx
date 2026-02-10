"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    PieChart,
    LogOut,
    Printer,
    Package,
    Calculator
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function Sidebar() {
    const pathname = usePathname();
    const { currentUser, logout, settings } = useAppStore();

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/",
            color: "text-sky-400 group-hover:text-sky-300",
        },
        {
            label: "Orçamentos",
            icon: FileText,
            href: "/quotes",
            color: "text-violet-400 group-hover:text-violet-300",
        },
        {
            label: "Produção (OS)",
            icon: Printer,
            href: "/production",
            color: "text-orange-400 group-hover:text-orange-300",
        },
        {
            label: "Clientes",
            icon: Users,
            href: "/clients",
            color: "text-pink-400 group-hover:text-pink-300",
        },
        {
            label: "Produtos",
            icon: Package,
            href: "/products",
            color: "text-blue-400 group-hover:text-blue-300",
        },
        {
            label: "Calculadora",
            icon: Calculator,
            href: "/calculator",
            color: "text-amber-400 group-hover:text-amber-300",
        },
    ]

    // Master only routes
    if (currentUser?.role === 'MASTER') {
        if (settings?.enableFinancial) {
            routes.push({
                label: "Financeiro",
                icon: PieChart,
                href: "/financial",
                color: "text-emerald-400 group-hover:text-emerald-300",
            })
        }
        routes.push({
            label: "Configurações",
            icon: Settings,
            href: "/settings",
            color: "text-slate-400 group-hover:text-slate-300",
        })
    }

    return (
        <div className="space-y-4 py-6 flex flex-col h-full bg-white text-slate-700">
            <div className="px-6 py-2 flex-1">
                <Link href="/" className="flex items-center mb-12 mt-2 group">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black italic tracking-tighter text-orange-600">
                                SKV
                            </span>
                            <div className="h-2 w-2 rounded-full bg-slate-800 animate-pulse"></div>
                        </div>
                        <div className="flex flex-col -mt-1">
                            <span className="text-[7px] font-bold text-slate-400 leading-tight tracking-[0.1em] uppercase">
                                Comunicação Visual
                            </span>
                            <span className="text-[7px] font-bold text-slate-400 leading-tight tracking-[0.1em] uppercase">
                                Brindes e Confecção
                            </span>
                        </div>
                    </div>
                </Link>

                <div className="space-y-2">
                    <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-[2px] mb-4">Dashboard Menu</p>
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3.5 w-full justify-start font-semibold cursor-pointer rounded-2xl transition-all duration-300 ease-in-out relative",
                                pathname === route.href
                                    ? "bg-orange-50 text-orange-600 border-r-4 border-orange-500"
                                    : "text-slate-500 hover:text-orange-500 hover:bg-orange-50/50"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn(
                                    "h-5 w-5 mr-4 transition-transform group-hover:scale-110",
                                    pathname === route.href ? "text-orange-600" : "text-slate-400"
                                )} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/30">
                {currentUser && (
                    <div className="mb-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold shadow-sm">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</span>
                            <span className="text-[11px] text-slate-500 truncate">{currentUser.email}</span>
                        </div>
                    </div>
                )}
                <Button
                    onClick={() => logout()}
                    variant="ghost"
                    className="w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl h-12"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair da Conta
                </Button>
            </div>
        </div>
    )
}
