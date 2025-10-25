"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function AttemptsChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch("/api/simulator/status")
      const result = await response.json()

      // Get login attempts from the last hour
      const attemptsResponse = await fetch("/api/login")
      // For now, we'll create mock time-series data
      // In a real implementation, you'd aggregate the actual attempts by time

      const now = Date.now()
      const mockData = []
      for (let i = 10; i >= 0; i--) {
        const time = new Date(now - i * 5 * 60 * 1000) // 5-minute intervals
        mockData.push({
          time: time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          exitosos: Math.floor(Math.random() * 50),
          fallidos: Math.floor(Math.random() * 100),
        })
      }

      setData(mockData)
    } catch (error) {
      console.error("Error fetching chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intentos de Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Cargando gráfico...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intentos de Autenticación</CardTitle>
        <CardDescription>Exitosos vs Fallidos en el tiempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            exitosos: {
              label: "Exitosos",
              color: "hsl(var(--chart-2))",
            },
            fallidos: {
              label: "Fallidos",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="exitosos"
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="fallidos"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
