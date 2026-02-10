"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts"
import { format, subMonths, isSameMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

export function FinancialCharts() {
    const { orders, clients } = useAppStore()

    // 1. Revenue per Month (Last 6 months)
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(new Date(), i);
        return {
            date: date,
            label: format(date, 'MMM/yy', { locale: ptBR }),
            total: 0
        }
    }).reverse();

    orders.forEach(order => {
        if (order.status === 'QUOTE') return; // Only actual orders
        const orderDate = new Date(order.createdAt);
        const monthData = last6Months.find(m => isSameMonth(m.date, orderDate));
        if (monthData) {
            monthData.total += order.total;
        }
    });

    // 2. Sales by Origin
    const originMap = new Map<string, number>();
    clients.forEach(client => {
        // Logic: Count revenue per client origin? Or just client count?
        // Prompt says "Volume de pedidos por canal de origem".
        // Let's link orders to clients to find origin.
        // Store doesn't link order -> client object directly, just ID and Name.
        // But we have clients list.
        // Let's count *Orders* by Client Origin.

        const clientOrders = orders.filter(o => o.clientId === client.id && o.status !== 'QUOTE');
        const origin = client.origin || 'Outros';
        const existing = originMap.get(origin) || 0;
        originMap.set(origin, existing + clientOrders.length);
    });

    const originData = Array.from(originMap.entries()).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Faturamento Recente</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={last6Months}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" fontSize={12} />
                            <YAxis fontSize={12} tickFormatter={(value) => `R$${value}`} />
                            <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
                            <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pedidos por Origem</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={originData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {originData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
