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
                    Gerencie as preferências do sistema SKV Flow.
                </p>
            </div>

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
        </div>
    )
}
