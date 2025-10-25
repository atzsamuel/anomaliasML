"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SystemControl() {
  const [metricsCollectorStatus, setMetricsCollectorStatus] = useState<any>(null)
  const [mlDetectorStatus, setMLDetectorStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchStatus = async () => {
    try {
      const [metricsResponse, mlResponse] = await Promise.all([fetch("/api/metrics/status"), fetch("/api/ml/status")])

      if (!metricsResponse.ok || !mlResponse.ok) {
        console.error("[v0] Status fetch failed:", {
          metrics: metricsResponse.status,
          ml: mlResponse.status,
        })
      }

      const metricsData = await metricsResponse.json()
      const mlData = await mlResponse.json()

      setMetricsCollectorStatus(metricsData.status || metricsData)
      setMLDetectorStatus(mlData.status || mlData)
    } catch (error) {
      console.error("Error fetching system status:", error)
      setMetricsCollectorStatus({ isRunning: false, collectionIntervalMs: 60000 })
      setMLDetectorStatus({ isRunning: false, modelTrained: false, detectionIntervalMs: 60000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleStartMetricsCollector = async () => {
    try {
      const response = await fetch("/api/metrics/start-collector", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        toast({ title: "Recolector iniciado", description: "El recolector de métricas está activo" })
        fetchStatus()
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo iniciar el recolector", variant: "destructive" })
    }
  }

  const handleStopMetricsCollector = async () => {
    try {
      const response = await fetch("/api/metrics/stop-collector", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        toast({ title: "Recolector detenido", description: "El recolector de métricas se ha detenido" })
        fetchStatus()
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo detener el recolector", variant: "destructive" })
    }
  }

  const handleTrainModel = async () => {
    try {
      toast({ title: "Entrenando modelo", description: "Esto puede tomar unos segundos..." })

      const response = await fetch("/api/ml/train", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        toast({
          title: "Modelo entrenado",
          description: `Entrenado con ${result.samplesTrained} muestras`,
        })
        fetchStatus()
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo entrenar el modelo", variant: "destructive" })
    }
  }

  const handleStartMLDetector = async () => {
    try {
      const response = await fetch("/api/ml/start-detector", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        toast({ title: "Detector iniciado", description: "El detector ML está activo" })
        fetchStatus()
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo iniciar el detector", variant: "destructive" })
    }
  }

  const handleStopMLDetector = async () => {
    try {
      const response = await fetch("/api/ml/stop-detector", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        toast({ title: "Detector detenido", description: "El detector ML se ha detenido" })
        fetchStatus()
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo detener el detector", variant: "destructive" })
    }
  }

  const handleRunDetection = async () => {
    try {
      toast({ title: "Ejecutando detección", description: "Analizando métricas..." })

      const response = await fetch("/api/ml/detect", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        toast({
          title: "Detección completada",
          description: `${result.detectionsCount || 0} IPs sospechosas detectadas`,
        })
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo ejecutar la detección", variant: "destructive" })
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando estado del sistema...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recolector de Métricas</CardTitle>
          <CardDescription>Recolecta métricas cada minuto de los intentos de login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Estado:</div>
              <Badge variant={metricsCollectorStatus?.isRunning ? "default" : "secondary"}>
                {metricsCollectorStatus?.isRunning ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex gap-2">
              {metricsCollectorStatus?.isRunning ? (
                <Button variant="destructive" onClick={handleStopMetricsCollector}>
                  <Square className="h-4 w-4 mr-2" />
                  Detener
                </Button>
              ) : (
                <Button onClick={handleStartMetricsCollector}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Intervalo de recolección: {metricsCollectorStatus?.collectionIntervalMs / 1000}s
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detector ML (Isolation Forest)</CardTitle>
          <CardDescription>Detecta anomalías automáticamente cada minuto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Estado:</div>
              <Badge variant={mlDetectorStatus?.isRunning ? "default" : "secondary"}>
                {mlDetectorStatus?.isRunning ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex gap-2">
              {mlDetectorStatus?.isRunning ? (
                <Button variant="destructive" onClick={handleStopMLDetector}>
                  <Square className="h-4 w-4 mr-2" />
                  Detener
                </Button>
              ) : (
                <Button onClick={handleStartMLDetector}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Modelo:</div>
              <Badge variant={mlDetectorStatus?.modelTrained ? "default" : "secondary"}>
                {mlDetectorStatus?.modelTrained ? "Entrenado" : "No entrenado"}
              </Badge>
            </div>
            <Button variant="outline" onClick={handleTrainModel}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Entrenar Modelo
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Intervalo de detección: {mlDetectorStatus?.detectionIntervalMs / 1000}s
          </div>

          <Button variant="outline" onClick={handleRunDetection} className="w-full bg-transparent">
            Ejecutar Detección Manual
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flujo de Trabajo Recomendado</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Iniciar el simulador de tráfico con IPs normales y anómalas</li>
            <li>Iniciar el recolector de métricas para capturar datos</li>
            <li>Esperar al menos 2-3 minutos para recolectar suficientes datos</li>
            <li>Entrenar el modelo ML con los datos recolectados</li>
            <li>Iniciar el detector ML para detección automática</li>
            <li>Monitorear el dashboard para ver las detecciones</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
