"use client"

import { useEffect, useState } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  FileText,
  Camera,
  Edit,
  Shield,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { OfficerData } from "./login-screen"

interface OfficerProfileProps {
  officer: OfficerData
  initialTab?: 'info' | 'stats' | 'activity' | 'settings'
  onClose: () => void
  onLogout: () => void
}

const recentActivity = [
  {
    id: 1,
    type: "incident",
    description: "Registró nuevo siniestro - Folio ST-2024-0901",
    timestamp: "Hace 2 horas",
    status: "completed",
  },
  {
    id: 2,
    type: "evidence",
    description: "Subió 12 fotografías - Folio ST-2024-0899",
    timestamp: "Hace 5 horas",
    status: "completed",
  },
  {
    id: 3,
    type: "document",
    description: "Completó IPH - Folio ST-2024-0897",
    timestamp: "Ayer, 16:30",
    status: "completed",
  },
  {
    id: 4,
    type: "incident",
    description: "Asignado a siniestro - Folio ST-2024-0902",
    timestamp: "Ayer, 10:15",
    status: "pending",
  },
  {
    id: 5,
    type: "training",
    description: "Completó capacitación: Nuevos Protocolos 2024",
    timestamp: "15 Ene 2024",
    status: "completed",
  },
]

const performanceMetrics = [
  { label: "Tiempo promedio de respuesta", value: "12 min", target: "15 min", progress: 80 },
  { label: "Tasa de resolución", value: "94%", target: "90%", progress: 94 },
  { label: "Documentación completa", value: "98%", target: "95%", progress: 98 },
  { label: "Satisfacción ciudadana", value: "4.8/5", target: "4.5/5", progress: 96 },
]

export function OfficerProfile({ officer, initialTab = 'info', onClose, onLogout }: OfficerProfileProps) {
  const [currentTab, setCurrentTab] = useState(initialTab)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedPhone, setEditedPhone] = useState(officer.phone)
  const [editedEmail, setEditedEmail] = useState(officer.email)

  const handleTabChange = (value: string) => {
    setCurrentTab(value as 'info' | 'stats' | 'activity' | 'settings')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "incident":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "evidence":
        return <Camera className="h-4 w-4 text-blue-500" />
      case "document":
        return <FileText className="h-4 w-4 text-emerald-500" />
      case "training":
        return <Award className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-slate-500" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  useEffect(() => {
    setCurrentTab(initialTab)
  }, [initialTab])

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background shadow-2xl overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Perfil del Oficial</h2>
              <p className="text-sm text-muted-foreground">Información y estadísticas</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={officer.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                      {getInitials(officer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{officer.name}</h3>
                      <p className="text-muted-foreground">{officer.rank}</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                      Activo
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {officer.badge}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {officer.zone}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {officer.shift}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="settings">Ajustes</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Datos de Contacto</CardTitle>
                    <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Información de Contacto</DialogTitle>
                          <DialogDescription>
                            Actualice su información de contacto institucional
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-email">Correo Electrónico</Label>
                            <Input
                              id="edit-email"
                              value={editedEmail}
                              onChange={(e) => setEditedEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-phone">Teléfono</Label>
                            <Input
                              id="edit-phone"
                              value={editedPhone}
                              onChange={(e) => setEditedPhone(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={() => setIsEditingProfile(false)}>
                            Guardar Cambios
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{officer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{officer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{officer.unit}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Ingreso: {officer.joinDate}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Certificaciones</CardTitle>
                  <CardDescription>Capacitaciones y acreditaciones vigentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {officer.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-amber-500" />
                          <span className="text-sm font-medium">{cert}</span>
                        </div>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                          Vigente
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        {officer.activeIncidents}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Incidentes Activos</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600">
                        {officer.completedIncidents}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Casos Completados</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Métricas de Desempeño</CardTitle>
                  <CardDescription>Período: Enero 2024</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{metric.value}</span>
                          <span className="text-xs text-muted-foreground">
                            (Meta: {metric.target})
                          </span>
                        </div>
                      </div>
                      <Progress value={metric.progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-2 rounded-full bg-muted">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                        {activity.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-1">
                    <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Preferencias de Notificación</p>
                          <p className="text-xs text-muted-foreground">
                            Configurar alertas y avisos
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <Separator />

                    <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Seguridad de la Cuenta</p>
                          <p className="text-xs text-muted-foreground">
                            Cambiar contraseña y PIN
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <Separator />

                    <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Firma Digital</p>
                          <p className="text-xs text-muted-foreground">
                            Gestionar firma electrónica
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="pt-6">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Última sesión: Hoy, 06:15 AM desde IP 192.168.1.45
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
