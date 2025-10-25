"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Activity, CheckCircle, XCircle } from "lucide-react"
import { AttemptsChart } from "./attempts-chart"
import { SuspiciousIPsTable } from "./suspicious-ips-table"
import { MetricsSummary } from "./metrics-summary"

interface DashboardOverviewProps {
  onSelectIP: (ip: string) => void
}

export function DashboardOverview({ onSelectIP }: DashboardOverviewProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/simulator/status")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando datos...</div>
      </div>
    )
  }

  const { stats: systemStats } = stats || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard General</h2>
        <div className="flex items-center gap-2">
          <Badge variant={autoRefresh ? "default" : "outline"}>
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? "Pausar" : "Reanudar"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Intentos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalAttempts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Intentos de autenticación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exitosos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats?.successfulAttempts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemStats?.totalAttempts > 0
                ? `${((systemStats.successfulAttempts / systemStats.totalAttempts) * 100).toFixed(1)}% tasa de éxito`
                : "0% tasa de éxito"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallidos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{systemStats?.failedAttempts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemStats?.totalAttempts > 0
                ? `${((systemStats.failedAttempts / systemStats.totalAttempts) * 100).toFixed(1)}% tasa de error`
                : "0% tasa de error"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Sospechosas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{systemStats?.suspiciousIPs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">De {systemStats?.uniqueIPs || 0} IPs únicas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AttemptsChart />
        <MetricsSummary />
      </div>

      {/* Suspicious IPs Table */}
      <SuspiciousIPsTable onSelectIP={onSelectIP} />
    </div>
  )
}
