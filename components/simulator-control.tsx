"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Play, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SimulatorControl() {
  const [normalIPs, setNormalIPs] = useState("192.168.1.1, 192.168.1.2")
  const [anomalousIPs, setAnomalousIPs] = useState("10.0.0.1, 10.0.0.2, 10.0.0.3")
  const [duration, setDuration] = useState("5")
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const handleStartSimulation = async () => {
    const normalIPArray = normalIPs
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean)
    const anomalousIPArray = anomalousIPs
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean)

    if (normalIPArray.length === 0 && anomalousIPArray.length === 0) {
      toast({
        title: "Error",
        description: "Debe proporcionar al menos una IP",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)

    try {
      const response = await fetch("/api/simulator/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          normalIPs: normalIPArray,
          anomalousIPs: anomalousIPArray,
          durationMinutes: Number.parseInt(duration),
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Simulación iniciada",
          description: `Simulando tráfico por ${duration} minutos`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar la simulación",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsRunning(false), Number.parseInt(duration) * 60 * 1000)
    }
  }

  const handleClearData = async () => {
    if (!confirm("¿Está seguro de que desea eliminar todos los datos?")) {
      return
    }

    try {
      const response = await fetch("/api/data/clear", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Datos eliminados",
          description: "Todos los datos han sido eliminados exitosamente",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar los datos",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Tráfico</CardTitle>
          <CardDescription>Configure y ejecute simulaciones de tráfico de login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="normal-ips">IPs con Comportamiento Normal</Label>
            <Input
              id="normal-ips"
              placeholder="192.168.1.1, 192.168.1.2"
              value={normalIPs}
              onChange={(e) => setNormalIPs(e.target.value)}
              disabled={isRunning}
            />
            <p className="text-xs text-muted-foreground">1-9 intentos por minuto, baja tasa de error</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anomalous-ips">IPs con Comportamiento Anómalo</Label>
            <Input
              id="anomalous-ips"
              placeholder="10.0.0.1, 10.0.0.2"
              value={anomalousIPs}
              onChange={(e) => setAnomalousIPs(e.target.value)}
              disabled={isRunning}
            />
            <p className="text-xs text-muted-foreground">10-150 intentos por minuto, alta tasa de error</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duración (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleStartSimulation} disabled={isRunning} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? "Simulación en curso..." : "Iniciar Simulación"}
            </Button>
            <Button variant="destructive" onClick={handleClearData} disabled={isRunning}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Datos
            </Button>
          </div>

          {isRunning && (
            <Badge variant="default" className="w-full justify-center py-2">
              Simulación en progreso...
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Simulador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Comportamiento Normal:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>1-9 intentos de login por minuto por IP</li>
              <li>Usuarios legítimos con credenciales válidas</li>
              <li>Algunos intentos fallidos ocasionales (10-30%)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Comportamiento Anómalo:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>10-150 intentos de login por minuto por IP (aleatorio)</li>
              <li>Ataques de fuerza bruta con diccionarios de contraseñas</li>
              <li>Alta tasa de error (70-100%)</li>
              <li>Patrones similares a herramientas como Nmap</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
