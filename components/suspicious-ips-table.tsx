"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface SuspiciousIPsTableProps {
  onSelectIP: (ip: string) => void
}

export function SuspiciousIPsTable({ onSelectIP }: SuspiciousIPsTableProps) {
  const [suspiciousIPs, setSuspiciousIPs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSuspiciousIPs = async () => {
    try {
      const response = await fetch("/api/detections/suspicious?limit=10")
      const result = await response.json()

      if (result.success) {
        setSuspiciousIPs(result.suspiciousIPs)
      }
    } catch (error) {
      console.error("Error fetching suspicious IPs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuspiciousIPs()
    const interval = setInterval(fetchSuspiciousIPs, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 IPs Sospechosas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-8">Cargando IPs sospechosas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Top 10 IPs Sospechosas
        </CardTitle>
        <CardDescription>IPs detectadas como anómalas por el modelo ML</CardDescription>
      </CardHeader>
      <CardContent>
        {suspiciousIPs.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">No se han detectado IPs sospechosas</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>Score de Anomalía</TableHead>
                <TableHead>Req/min</TableHead>
                <TableHead>Error Ratio</TableHead>
                <TableHead>Última Detección</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspiciousIPs.map((detection) => (
                <TableRow key={detection.ip}>
                  <TableCell className="font-mono">{detection.ip}</TableCell>
                  <TableCell>
                    <Badge variant={detection.anomalyScore > 0.7 ? "destructive" : "default"}>
                      {(detection.anomalyScore * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{detection.metrics.requestsPerMinute.toFixed(1)}</TableCell>
                  <TableCell>{(detection.metrics.errorRatio * 100).toFixed(1)}%</TableCell>
                  <TableCell>{new Date(detection.timestamp).toLocaleString("es-ES")}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => onSelectIP(detection.ip)}>
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
