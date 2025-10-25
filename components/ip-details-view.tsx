"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, AlertTriangle, CheckCircle } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface IPDetailsViewProps {
  selectedIP: string | null
  onSelectIP: (ip: string) => void
}

export function IPDetailsView({ selectedIP, onSelectIP }: IPDetailsViewProps) {
  const [searchIP, setSearchIP] = useState(selectedIP || "")
  const [ipData, setIPData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchIPData = async (ip: string) => {
    if (!ip) return

    setLoading(true)
    try {
      // Fetch metrics
      const metricsResponse = await fetch(`/api/metrics/history?ip=${ip}`)
      const metricsResult = await metricsResponse.json()

      // Fetch detections
      const detectionsResponse = await fetch(`/api/detections?ip=${ip}`)
      const detectionsResult = await detectionsResponse.json()

      setIPData({
        ip,
        metrics: metricsResult.metrics || [],
        detections: detectionsResult.detections || [],
      })
    } catch (error) {
      console.error("Error fetching IP data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedIP) {
      setSearchIP(selectedIP)
      fetchIPData(selectedIP)
    }
  }, [selectedIP])

  const handleSearch = () => {
    if (searchIP) {
      onSelectIP(searchIP)
      fetchIPData(searchIP)
    }
  }

  const metricsChartData =
    ipData?.metrics.map((m: any) => ({
      time: new Date(m.windowEnd).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      "Req/min": m.requestsPerMinute,
      "Error %": m.errorRatio * 100,
    })) || []

  const suspiciousTimeRanges =
    ipData?.detections
      .filter((d: any) => d.isSuspicious)
      .flatMap((d: any) => d.suspiciousTimeRanges)
      .sort((a: any, b: any) => b.start - a.start) || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buscar IP</CardTitle>
          <CardDescription>Ingrese una dirección IP para ver sus detalles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ej: 192.168.1.100"
              value={searchIP}
              onChange={(e) => setSearchIP(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!searchIP}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="text-center py-8 text-muted-foreground">Cargando datos de la IP...</div>}

      {!loading && ipData && (
        <>
          {/* IP Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-mono">{ipData.ip}</span>
                {ipData.detections.some((d: any) => d.isSuspicious) ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Sospechosa
                  </Badge>
                ) : (
                  <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Normal
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Total de Métricas</div>
                  <div className="text-2xl font-bold">{ipData.metrics.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Detecciones</div>
                  <div className="text-2xl font-bold">{ipData.detections.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Veces Sospechosa</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {ipData.detections.filter((d: any) => d.isSuspicious).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Chart */}
          {metricsChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Métricas Recolectadas</CardTitle>
                <CardDescription>Evolución de las métricas en el tiempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    "Req/min": {
                      label: "Requests/min",
                      color: "hsl(var(--chart-3))",
                    },
                    "Error %": {
                      label: "Error %",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="Req/min" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                      <Line type="monotone" dataKey="Error %" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Suspicious Time Ranges */}
          {suspiciousTimeRanges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tiempo en donde la IP fue sospechosa</CardTitle>
                <CardDescription>Rangos de tiempo detectados como anómalos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Duración</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspiciousTimeRanges.map((range: any, index: number) => {
                      const duration = range.end - range.start
                      const durationSeconds = Math.floor(duration / 1000)
                      return (
                        <TableRow key={index}>
                          <TableCell>{new Date(range.start).toLocaleString("es-ES")}</TableCell>
                          <TableCell>{new Date(range.end).toLocaleString("es-ES")}</TableCell>
                          <TableCell>{durationSeconds}s</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!loading && !ipData && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Ingrese una IP para ver sus detalles
          </CardContent>
        </Card>
      )}
    </div>
  )
}
