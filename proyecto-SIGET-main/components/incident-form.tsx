"use client"

import { useState } from "react"
import {
  MapPin,
  Calendar,
  Clock,
  FileText,
  ChevronRight,
  ChevronLeft,
  Download,
  Car,
  Users,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Datos Generales", icon: FileText },
  { id: 2, title: "Ubicación", icon: MapPin },
  { id: 3, title: "Vehículos", icon: Car },
  { id: 4, title: "Involucrados", icon: Users },
]

export function IncidentForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    folio: "ST-2024-0896",
    area: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    incidentType: "",
    description: "",
    street1: "",
    street2: "",
    colony: "",
    reference: "",
    vehicleCount: "2",
    injuredCount: "0",
    fatalCount: "0",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Registro de Siniestro
        </h1>
        <p className="text-muted-foreground">
          Crear un nuevo reporte de incidente de tránsito
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "font-medium hidden md:inline",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-4 h-0.5 w-16 lg:w-24",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {steps.find((s) => s.id === currentStep)?.title}
              </CardTitle>
              <CardDescription>
                Complete la información requerida para continuar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStep === 1 && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="folio">Folio (Auto-generado)</Label>
                      <Input
                        id="folio"
                        value={formData.folio}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Área</Label>
                      <Select
                        value={formData.area}
                        onValueChange={(v) => handleInputChange("area", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar área" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ciudad">Ciudad</SelectItem>
                          <SelectItem value="periferico">Periférico</SelectItem>
                          <SelectItem value="metropolitana">
                            Metropolitana
                          </SelectItem>
                          <SelectItem value="estatal">Estatal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            handleInputChange("date", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Hora</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            handleInputChange("time", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incidentType">Tipo de Siniestro</Label>
                    <Select
                      value={formData.incidentType}
                      onValueChange={(v) =>
                        handleInputChange("incidentType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colision">Colisión</SelectItem>
                        <SelectItem value="atropellamiento">
                          Atropellamiento
                        </SelectItem>
                        <SelectItem value="volcadura">Volcadura</SelectItem>
                        <SelectItem value="caida">
                          Caída de pasajero/motociclista
                        </SelectItem>
                        <SelectItem value="proyeccion">
                          Proyección de objetos
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción del Hecho</Label>
                    <Textarea
                      id="description"
                      placeholder="Describa brevemente las circunstancias del siniestro..."
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="street1">Calle Principal</Label>
                      <Input
                        id="street1"
                        placeholder="Nombre de la calle"
                        value={formData.street1}
                        onChange={(e) =>
                          handleInputChange("street1", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street2">Entre Calle / Esquina</Label>
                      <Input
                        id="street2"
                        placeholder="Calle de referencia"
                        value={formData.street2}
                        onChange={(e) =>
                          handleInputChange("street2", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colony">Colonia / Fraccionamiento</Label>
                    <Input
                      id="colony"
                      placeholder="Nombre de la colonia"
                      value={formData.colony}
                      onChange={(e) =>
                        handleInputChange("colony", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Punto de Referencia</Label>
                    <Textarea
                      id="reference"
                      placeholder="Descripción adicional del lugar..."
                      value={formData.reference}
                      onChange={(e) =>
                        handleInputChange("reference", e.target.value)
                      }
                      rows={2}
                    />
                  </div>

                  {/* Mock Map/Croquis */}
                  <div className="space-y-2">
                    <Label>Croquis / Geolocalización</Label>
                    <div className="relative h-64 rounded-lg border-2 border-dashed bg-muted/50 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Área de croquis interactivo
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                          <Download className="mr-2 h-4 w-4" />
                          Exportar a PDF Oficial
                        </Button>
                      </div>
                      {/* Grid overlay for croquis effect */}
                      <div className="absolute inset-0 pointer-events-none opacity-20">
                        <svg className="h-full w-full">
                          <defs>
                            <pattern
                              id="grid"
                              width="20"
                              height="20"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 20 0 L 0 0 0 20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.5"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleCount">
                      Número de Vehículos Involucrados
                    </Label>
                    <Select
                      value={formData.vehicleCount}
                      onValueChange={(v) =>
                        handleInputChange("vehicleCount", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} {n === 1 ? "vehículo" : "vehículos"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    {Array.from({
                      length: parseInt(formData.vehicleCount) || 0,
                    }).map((_, i) => (
                      <Card key={i} className="bg-muted/30">
                        <CardHeader className="py-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Vehículo {i + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-3 pb-4">
                          <Input placeholder="Marca" />
                          <Input placeholder="Modelo" />
                          <Input placeholder="Placas" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="injuredCount">Personas Lesionadas</Label>
                      <Input
                        id="injuredCount"
                        type="number"
                        min="0"
                        value={formData.injuredCount}
                        onChange={(e) =>
                          handleInputChange("injuredCount", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatalCount">Personas Fallecidas</Label>
                      <Input
                        id="fatalCount"
                        type="number"
                        min="0"
                        value={formData.fatalCount}
                        onChange={(e) =>
                          handleInputChange("fatalCount", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {parseInt(formData.injuredCount) > 0 && (
                    <div className="space-y-3">
                      <Label>Datos de Lesionados</Label>
                      {Array.from({
                        length: parseInt(formData.injuredCount),
                      }).map((_, i) => (
                        <Card key={i} className="bg-muted/30">
                          <CardContent className="grid gap-3 md:grid-cols-3 py-4">
                            <Input placeholder="Nombre completo" />
                            <Input placeholder="Edad" type="number" />
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Condición" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="leve">Lesión leve</SelectItem>
                                <SelectItem value="moderada">
                                  Lesión moderada
                                </SelectItem>
                                <SelectItem value="grave">Lesión grave</SelectItem>
                              </SelectContent>
                            </Select>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">
                          Verificación Requerida
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          Asegúrese de registrar todos los involucrados antes de
                          continuar con el proceso de cadena de custodia.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                {currentStep < steps.length ? (
                  <Button onClick={nextStep}>
                    Siguiente
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Guardar Siniestro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen del Folio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Folio:</span>
                <Badge variant="secondary">{formData.folio}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Área:</span>
                <span className="text-sm font-medium capitalize">
                  {formData.area || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fecha:</span>
                <span className="text-sm font-medium">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hora:</span>
                <span className="text-sm font-medium">{formData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vehículos:</span>
                <span className="text-sm font-medium">
                  {formData.vehicleCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Progreso</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-primary/20">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Paso {currentStep} de {steps.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
