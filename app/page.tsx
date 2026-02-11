"use client"

import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { StatCards } from "@/components/dashboard/StatCards"
import { ActivityChart } from "@/components/dashboard/ActivityChart"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Printer, Users, Bug } from "lucide-react"
import { useRouter } from "next/navigation"
import { testDatabaseConnection } from "@/lib/actions/debug"
import { useState } from "react"

export default function Home() {
  const { currentUser, orders } = useAppStore()
  const router = useRouter()
  const [debugResult, setDebugResult] = useState<any>(null)

  const runDebug = async () => {
    const result = await testDatabaseConnection()
    setDebugResult(result)
    alert(JSON.stringify(result, null, 2))
  }

  // Calculate real stats
  const stats = {
    quotes: orders.filter(o => o.status === 'QUOTE').length,
    production: orders.filter(o => ['APPROVED', 'PRODUCTION'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    revenue: currentUser?.role === 'MASTER'
      ? orders.filter(o => o.status !== 'QUOTE').reduce((acc, curr) => acc + curr.total, 0)
      : undefined
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Banner */}
      <div className="orange-gradient rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl flex items-center justify-between min-h-[220px]">
        <div className="relative z-10 space-y-4 max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight">Bem-vindo, {currentUser?.name || 'Syed'}!</h1>
          <p className="text-white/80 text-lg font-medium leading-relaxed">
            Seu dashboard está pronto. Acompanhe a produção em tempo real e gerencie seus orçamentos com agilidade.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button onClick={() => router.push('/quotes/new')} size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl px-8 h-14 shadow-lg shadow-white/10">
              <Plus className="mr-2 h-5 w-5" /> Novo Orçamento
            </Button>
            <Button onClick={() => router.push('/orders/new')} size="lg" className="bg-orange-500 text-white hover:bg-orange-400 font-bold rounded-2xl px-8 h-14 shadow-lg shadow-black/20 border-none">
              <Printer className="mr-2 h-5 w-5" /> Novo Pedido (Direto)
            </Button>
            <Button onClick={() => router.push('/clients')} variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10 font-bold rounded-2xl px-8 h-14">
              <Users className="mr-2 h-5 w-5" /> Ver Clientes
            </Button>
            <Button onClick={runDebug} variant="outline" size="lg" className="bg-red-500/20 border-red-500/50 text-white hover:bg-red-500/30 font-bold rounded-2xl px-8 h-14">
              <Bug className="mr-2 h-5 w-5" /> Debug DB
            </Button>
          </div>
        </div>

        {/* Abstract Illustration (CSS only) */}
        <div className="hidden lg:flex relative h-40 w-64 items-center justify-center opacity-90">
          <div className="absolute w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 rotate-[-12deg] shadow-xl">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 rotate-[12deg] mt-8 shadow-xl">
              <Printer className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Visão Geral</h2>
        </div>
        <StatCards stats={stats} />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Produção Ativa (Kanban)</h2>
              <Button variant="ghost" onClick={() => router.push('/production')} className="text-orange-500 font-bold hover:text-orange-600 hover:bg-orange-50">ver todos</Button>
            </div>
            <KanbanBoard />
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-6">
            <ActivityChart />
          </section>

          {/* Quick Actions Card */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="h-32 w-32" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ações Rápidas</h3>
            <p className="text-slate-400 text-sm mb-6">Acesse as ferramentas principais em um clique.</p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/calculator')} className="w-full justify-start bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl h-12 border-none">
                <CalculatorIcon className="mr-3 h-4 w-4" /> Calculadora de Custos
              </Button>
              <Button onClick={() => router.push('/financial/payable')} className="w-full justify-start bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl h-12 border border-white/10">
                <ArrowDownCircle className="mr-3 h-4 w-4 text-red-400" /> Contas a Pagar
              </Button>
              <Button onClick={() => router.push('/financial/receivable')} className="w-full justify-start bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl h-12 border border-white/10">
                <ArrowUpCircle className="mr-3 h-4 w-4 text-green-400" /> Contas a Receber
              </Button>
              <Button variant="ghost" onClick={() => router.push('/quotes')} className="w-full justify-start hover:bg-white/5 text-slate-300 font-bold rounded-xl h-12">
                <FileText className="mr-3 h-4 w-4" /> Todos Orçamentos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowDownCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="m8 12 4 4 4-4" />
    </svg>
  )
}

function ArrowUpCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m16 12-4-4-4 4" />
      <path d="M12 16V8" />
    </svg>
  )
}

function CalculatorIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  )
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
