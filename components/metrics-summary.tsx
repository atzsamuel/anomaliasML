"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function MetricsSummary() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch("/api/metrics/history")
      const result = await response.json()

      if (result.success && result.ips) {
        // Aggregate metrics by IP
        const aggregated = result.ips.slice(0, 10).map((ipData: any) => {
          const metrics = ipData.metrics
          const avgRequestsPerMinute =
            metrics.reduce((sum: number, m: any) => sum + m.requestsPerMinute, 0) / metrics.length
          const avgErrorRatio = metrics.reduce((sum: number, m: any) => sum + m.errorRatio, 0) / metrics.length

          return {
            ip: ipData.ip.substring(0, 15) + "...",
            "Req/min": Number.parseFloat(avgRequestsPerMinute.toFixed(2)),
            "Error %": Number.parseFloat((avgErrorRatio * 100).toFixed(2)),
          }
        })

        setData(aggregated)
      }
    } catch (error) {
      console.error("Error fetching metrics summary:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Métricas</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Cargando métricas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Métricas</CardTitle>
        <CardDescription>Top 10 IPs por actividad</CardDescription>
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
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ip" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="Req/min" fill="hsl(var(--chart-3))" />
              <Bar dataKey="Error %" fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
