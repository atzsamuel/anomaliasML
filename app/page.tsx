"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardOverview } from "@/components/dashboard-overview"
import { IPDetailsView } from "@/components/ip-details-view"
import { SimulatorControl } from "@/components/simulator-control"
import { SystemControl } from "@/components/system-control"

export default function Home() {
  const [selectedIP, setSelectedIP] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">ML Anomaly Detection System</h1>
          <p className="text-muted-foreground mt-2">Isolation Forest para detección de ataques de fuerza bruta</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ip-details">Detalles por IP</TabsTrigger>
            <TabsTrigger value="simulator">Simulador</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardOverview onSelectIP={setSelectedIP} />
          </TabsContent>

          <TabsContent value="ip-details" className="space-y-6">
            <IPDetailsView selectedIP={selectedIP} onSelectIP={setSelectedIP} />
          </TabsContent>

          <TabsContent value="simulator" className="space-y-6">
            <SimulatorControl />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemControl />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
