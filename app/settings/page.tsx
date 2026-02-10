"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    const { currentUser, settings, updateSettings, products } = useAppStore();

    if (currentUser?.role !== 'MASTER') {
        return <div className="p-8">Acesso restrito.</div>
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">
                    Gerencie produtos, usuários e preferências do sistema.
                </p>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Usuários</TabsTrigger>
                    <TabsTrigger value="system">Sistema</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestão de Usuários</CardTitle>
                            <CardDescription>Lista de usuários com acesso ao sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Funcionalidade simplificada para esta demonstração.</p>
                            <div className="mt-4 space-y-2">
                                <div className="p-4 border rounded flex justify-between items-center">
                                    <span>Master Admin (master@admin.com)</span>
                                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded">MASTER</span>
                                </div>
                                <div className="p-4 border rounded flex justify-between items-center">
                                    <span>Atendente (atendente@admin.com)</span>
                                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">ATTENDANT</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
