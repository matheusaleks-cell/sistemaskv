"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { UserDialog } from "@/components/settings/UserDialog"
import { Badge } from "@/components/ui/badge"
import { User } from "@/types"

export default function SettingsPage() {
    const { currentUser, settings, updateSettings, users } = useAppStore();

    if (currentUser?.role !== 'MASTER') {
        return <div className="p-8">Acesso restrito.</div>
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
                    <p className="text-muted-foreground">
                        Gerencie as preferências e acessos do sistema SKV Flow.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="bg-slate-100 rounded-xl p-1">
                    <TabsTrigger value="users" className="rounded-lg px-6">Usuários</TabsTrigger>
                    <TabsTrigger value="system" className="rounded-lg px-6">Sistema</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                        <div>
                            <h3 className="text-lg font-bold">Gestão de Usuários</h3>
                            <p className="text-sm text-muted-foreground">Adicione ou remova quem pode acessar o sistema.</p>
                        </div>
                        <UserDialog />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {users.map((user: User) => (
                            <Card key={user.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-slate-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                            <div className="h-6 w-6 font-bold text-slate-500 flex items-center justify-center text-xs">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>
                                        <Badge variant={user.role === 'MASTER' ? 'default' : 'outline'} className={user.role === 'MASTER' ? "bg-orange-500" : ""}>
                                            {user.role}
                                        </Badge>
                                    </div>
                                    <h4 className="font-bold text-slate-800">{user.name}</h4>
                                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="system">
                    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Preferências do Sistema</CardTitle>
                            <CardDescription>Configure como o sistema deve se comportar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Habilitar Módulo Financeiro</Label>
                                    <p className="text-xs text-muted-foreground">Mostra resumos de faturamento e fluxo de caixa.</p>
                                </div>
                                <Switch
                                    checked={settings.enableFinancial}
                                    onCheckedChange={(checked) => updateSettings({ enableFinancial: checked })}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Checklist de Qualidade</Label>
                                    <p className="text-xs text-muted-foreground">Exige conferência de itens antes de finalizar a produção.</p>
                                </div>
                                <Switch
                                    checked={settings.enableQualityChecklist}
                                    onCheckedChange={(checked) => updateSettings({ enableQualityChecklist: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
