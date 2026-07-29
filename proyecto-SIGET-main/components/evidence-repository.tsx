"use client"

import { useState, useRef } from "react"
import {
  Upload,
  Image,
  Video,
  FileText,
  Download,
  QrCode,
  Clock,
  User,
  Package,
  ChevronRight,
  Plus,
  X,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const evidenceItems = [
  {
    id: "EV-001",
    type: "photo",
    name: "Vista frontal Vehículo 1",
    group: "Vehículo 1",
    timestamp: "10:45:23",
    qrId: "QR-2024-0895-001",
  },
  {
    id: "EV-002",
    type: "photo",
    name: "Daños laterales Vehículo 1",
    group: "Vehículo 1",
    timestamp: "10:46:12",
    qrId: "QR-2024-0895-002",
  },
  {
    id: "EV-003",
    type: "video",
    name: "Video panorámico del lugar",
    group: "Escena",
    timestamp: "10:48:00",
    qrId: "QR-2024-0895-003",
  },
  {
    id: "EV-004",
    type: "photo",
    name: "Indicio: Fragmento de faro",
    group: "Indicio A",
    timestamp: "10:50:34",
    qrId: "QR-2024-0895-004",
  },
  {
    id: "EV-005",
    type: "photo",
    name: "Vista trasera Vehículo 2",
    group: "Vehículo 2",
    timestamp: "10:52:18",
    qrId: "QR-2024-0895-005",
  },
  {
    id: "EV-006",
    type: "document",
    name: "Licencia de conducir",
    group: "Documentos",
    timestamp: "10:55:00",
    qrId: "QR-2024-0895-006",
  },
]

const custodyChain = [
  {
    id: 1,
    action: "Recolección en sitio",
    person: "Perito Ángel Sánchez",
    time: "10:45",
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: 2,
    action: "Traslado a oficina",
    person: "Perito Ángel Sánchez",
    time: "11:30",
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: 3,
    action: "Registro en sistema",
    person: "Aux. María López",
    time: "12:15",
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: 4,
    action: "Resguardo en almacén",
    person: "Enc. Roberto Díaz",
    time: "—",
    date: "—",
    status: "pending",
  },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case "photo":
      return Image
    case "video":
      return Video
    default:
      return FileText
  }
}

export function EvidenceRepository() {
  const [items, setItems] = useState(evidenceItems)
  const [isDragging, setIsDragging] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState("all")

  const [newType, setNewType] = useState<string>("photo")
  const [newGroup, setNewGroup] = useState<string>("vehiculo1")
  const [newDescription, setNewDescription] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
  }

  const addFiles = (files: FileList) => {
    const newItems = Array.from(files).map((file, i) => {
      const type = file.type.startsWith("image/")
        ? "photo"
        : file.type.startsWith("video/")
        ? "video"
        : "document"
      
      const groupMap: { [key: string]: string } = {
        photo: "Vehículo 1",
        video: "Escena",
        document: "Documentos"
      }

      return {
        id: `EV-${Date.now()}-${i}`,
        type,
        name: file.name,
        group: groupMap[type] || "Escena",
        timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        qrId: `QR-2024-0895-0${items.length + i + 1}`,
      }
    })
    setItems((prev) => [...newItems, ...prev])
  }

  const handleRegisterEvidence = () => {
    if (!newDescription.trim()) return

    const groupMap: { [key: string]: string } = {
      vehiculo1: "Vehículo 1",
      vehiculo2: "Vehículo 2",
      escena: "Escena",
      indicio: "Indicio A",
      documentos: "Documentos"
    }

    const newItem = {
      id: `EV-${Date.now()}`,
      type: newType,
      name: newDescription,
      group: groupMap[newGroup] || "Escena",
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      qrId: `QR-2024-0895-0${items.length + 1}`,
    }

    setItems((prev) => [newItem, ...prev])
    setNewDescription("")
    setIsDialogOpen(false)
  }

  const groups = ["all", ...new Set(items.map((item) => item.group))]
  const filteredItems =
    selectedGroup === "all"
      ? items
      : items.filter((item) => item.group === selectedGroup)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Repositorio de Evidencias
          </h1>
          <p className="text-muted-foreground">
            Gestión de archivos y cadena de custodia - Folio ST-2024-0895
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Evidencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Evidencia</DialogTitle>
              <DialogDescription>
                Registre una nueva evidencia en la cadena de custodia
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Archivo de Evidencia (Opcional)</Label>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setNewDescription(file.name)
                      const type = file.type.startsWith("image/")
                        ? "photo"
                        : file.type.startsWith("video/")
                        ? "video"
                        : "document"
                      setNewType(type)
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Evidencia</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Fotografía</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grupo / Categoría</Label>
                <Select value={newGroup} onValueChange={setNewGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehiculo1">Vehículo 1</SelectItem>
                    <SelectItem value="vehiculo2">Vehículo 2</SelectItem>
                    <SelectItem value="escena">Escena</SelectItem>
                    <SelectItem value="indicio">Indicio</SelectItem>
                    <SelectItem value="documentos">Documentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descripción / Nombre</Label>
                <Input 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descripción breve de la evidencia" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setNewDescription("")
                setIsDialogOpen(false)
              }}>
                Cancelar
              </Button>
              <Button onClick={handleRegisterEvidence} disabled={!newDescription.trim()}>
                Registrar Evidencia
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="gallery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gallery">Galería de Evidencias</TabsTrigger>
          <TabsTrigger value="custody">Cadena de Custodia</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          {/* Upload Area */}
          <Card>
            <CardContent className="pt-6">
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  if (e.dataTransfer.files) {
                    addFiles(e.dataTransfer.files)
                  }
                }}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
                <Upload
                  className={cn(
                    "h-10 w-10",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p className="mt-2 text-sm font-medium">
                  Arrastre archivos aquí o haga clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Soporta imágenes, videos y documentos
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}>
                  Seleccionar Archivos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter & Gallery */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtrar por:</span>
            {groups.map((group) => (
              <Badge
                key={group}
                variant={selectedGroup === group ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedGroup(group)}
              >
                {group === "all" ? "Todos" : group}
              </Badge>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const Icon = getFileIcon(item.type)
              return (
                <Card
                  key={item.id}
                  className="group overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video bg-muted flex items-center justify-center">
                    <Icon className="h-12 w-12 text-muted-foreground/50" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-xs"
                    >
                      {item.type === "photo"
                        ? "Foto"
                        : item.type === "video"
                        ? "Video"
                        : "Doc"}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        {item.qrId}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.timestamp}
                      </span>
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {item.group}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Download Actions */}
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Descargar ZIP Completo
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generar Acta de Custodia (PDF)
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="custody" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Eslabones de Custodia
              </CardTitle>
              <CardDescription>
                Registro cronológico de responsabilidad sobre las evidencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-0 h-full w-0.5 bg-border" />

                <div className="space-y-6">
                  {custodyChain.map((step, index) => (
                    <div key={step.id} className="relative flex gap-4">
                      <div
                        className={cn(
                          "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2",
                          step.status === "completed"
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-muted-foreground bg-background text-muted-foreground"
                        )}
                      >
                        {step.status === "completed" ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{step.action}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {step.person}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {step.time}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              step.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className={cn(
                              step.status === "completed" &&
                                "bg-emerald-500 hover:bg-emerald-600"
                            )}
                          >
                            {step.status === "completed"
                              ? "Completado"
                              : "Pendiente"}
                          </Badge>
                        </div>
                        {step.date !== "—" && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Fecha: {step.date}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Registro de Transferencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Entrega:</Label>
                  <Input placeholder="Nombre del responsable que entrega" />
                </div>
                <div className="space-y-2">
                  <Label>Recibe:</Label>
                  <Input placeholder="Nombre del responsable que recibe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Motivo de Transferencia:</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resguardo">
                      Resguardo en almacén
                    </SelectItem>
                    <SelectItem value="analisis">
                      Análisis pericial
                    </SelectItem>
                    <SelectItem value="ministerio">
                      Remisión a Ministerio Público
                    </SelectItem>
                    <SelectItem value="devolucion">
                      Devolución a propietario
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">
                Registrar Transferencia
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
