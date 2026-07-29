"use client"

import {
  AlertTriangle,
  Users,
  Package,
  FileCheck,
  Clock,
  MapPin,
  User,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const kpiData = [
  {
    title: "Siniestros Activos",
    value: "12",
    change: "+3",
    trend: "up",
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Peritos Asignados",
    value: "8",
    change: "+1",
    trend: "up",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Evidencias Resguardadas",
    value: "47",
    change: "+12",
    trend: "up",
    icon: Package,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "IPH Completados",
    value: "156",
    change: "-2",
    trend: "down",
    icon: FileCheck,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
]

const incidentTimeline = [
  {
    id: "ST-2024-0895",
    location: "Periférico Km 24",
    status: "proceso",
    perito: "Ángel Sánchez",
    time: "10:45",
    type: "Colisión múltiple",
  },
  {
    id: "ST-2024-0894",
    location: "Av. Colón x Calle 60",
    status: "transito",
    perito: "María González",
    time: "09:30",
    type: "Atropellamiento",
  },
  {
    id: "ST-2024-0893",
    location: "Carr. Mérida-Progreso Km 15",
    status: "no-atendido",
    perito: "Sin asignar",
    time: "08:15",
    type: "Volcadura",
  },
  {
    id: "ST-2024-0892",
    location: "Prolongación Montejo",
    status: "proceso",
    perito: "Carlos Ruiz",
    time: "07:50",
    type: "Colisión lateral",
  },
  {
    id: "ST-2024-0891",
    location: "Anillo Periférico Sur",
    status: "transito",
    perito: "Laura Méndez",
    time: "07:20",
    type: "Choque frontal",
  },
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case "proceso":
      return {
        label: "En Proceso",
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      }
    case "transito":
      return {
        label: "En Tránsito",
        color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      }
    case "no-atendido":
      return {
        label: "No Atendido",
        color: "bg-red-500/10 text-red-600 border-red-500/20",
      }
    default:
      return {
        label: "Desconocido",
        color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      }
  }
}

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Panel de Control
        </h1>
        <p className="text-muted-foreground">
          Resumen ejecutivo del Sistema Integral de Gestión de Evidencias de Tránsito
        </p>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={cn("rounded-lg p-2", kpi.bgColor)}>
                  <Icon className={cn("h-4 w-4", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{kpi.value}</span>
                  <span
                    className={cn(
                      "flex items-center text-sm font-medium",
                      kpi.trend === "up"
                        ? "text-emerald-600"
                        : "text-red-600"
                    )}
                  >
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {kpi.change}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  vs. turno anterior
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Incident Status Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seguimiento de Siniestros</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Estado actual de incidentes en tiempo real
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                En Proceso: 4
              </Badge>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                En Tránsito: 5
              </Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                No Atendido: 3
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {incidentTimeline.map((incident) => {
              const statusConfig = getStatusConfig(incident.status)
              return (
                <div
                  key={incident.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium mt-1">
                        {incident.time}
                      </span>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          {incident.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={statusConfig.color}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {incident.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {incident.perito}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{incident.type}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
