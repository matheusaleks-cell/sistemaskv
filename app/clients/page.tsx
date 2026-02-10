import { ClientDialog } from "@/components/clients/ClientDialog"
import { ClientTable } from "@/components/clients/ClientTable"

export default function ClientsPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
                    <p className="text-muted-foreground">
                        Gerencie sua base de clientes aqui.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <ClientDialog />
                </div>
            </div>
            <ClientTable />
        </div>
    )
}
