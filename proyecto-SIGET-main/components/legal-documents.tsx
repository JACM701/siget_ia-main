"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  Mic,
  PenTool,
  Check,
  Clock,
  User,
  Shield,
  AlertCircle,
  Printer,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

const documentTypes = [
  {
    id: "iph",
    title: "IPH - Informe Policial Homologado",
    description: "Documento oficial de registro del siniestro",
    status: "draft",
    lastModified: "Hace 10 min",
  },
  {
    id: "acta-entrevista",
    title: "Acta de Entrevista",
    description: "Declaración de los involucrados",
    status: "pending-signature",
    lastModified: "Hace 25 min",
  },
  {
    id: "derechos",
    title: "Lectura de Derechos",
    description: "Constancia de información de derechos",
    status: "completed",
    lastModified: "Hace 1 hora",
  },
  {
    id: "custodia",
    title: "Acta de Cadena de Custodia",
    description: "Registro de evidencias recolectadas",
    status: "draft",
    lastModified: "Hace 2 horas",
  },
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        label: "Completado",
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        icon: Check,
      }
    case "pending-signature":
      return {
        label: "Pendiente Firma",
        color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        icon: PenTool,
      }
    case "draft":
      return {
        label: "Borrador",
        color: "bg-slate-500/10 text-slate-600 border-slate-500/20",
        icon: FileText,
      }
    default:
      return {
        label: "Desconocido",
        color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        icon: FileText,
      }
  }
}

export function LegalDocuments() {
  const [selectedDoc, setSelectedDoc] = useState("iph")
  const [signatures, setSignatures] = useState({
    officer: false,
    citizen1: false,
    citizen2: false,
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Documentos Legales
        </h1>
        <p className="text-muted-foreground">
          Generación y firma de documentos oficiales - Folio ST-2024-0895
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Documentos del Expediente
          </h2>
          {documentTypes.map((doc) => {
            const statusConfig = getStatusConfig(doc.status)
            const StatusIcon = statusConfig.icon
            const isSelected = selectedDoc === doc.id
            return (
              <Card
                key={doc.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedDoc(doc.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className={statusConfig.color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {doc.lastModified}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Document Preview & Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="preview">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                <TabsTrigger value="signatures">Firmas</TabsTrigger>
                <TabsTrigger value="attachments">Anexos</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>

            <TabsContent value="preview" className="mt-4">
              {/* Official Document Preview */}
              <Card className="overflow-hidden">
                <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-4R0fk928sMYw0UPmnjAVXTOhexU95A.png"
                      alt="Logo SSP"
                      className="h-12 w-12 object-contain"
                    />
                    <div>
                      <p className="font-bold text-lg">
                        SECRETARÍA DE SEGURIDAD PÚBLICA
                      </p>
                      <p className="text-sm text-slate-300">
                        GOBIERNO DEL ESTADO DE YUCATÁN
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Folio:</p>
                    <p className="font-mono font-bold">ST-2024-0895</p>
                  </div>
                </div>

                <CardContent className="p-6 bg-white">
                  <div className="space-y-6">
                    {/* Document Title */}
                    <div className="text-center border-b pb-4">
                      <h2 className="text-xl font-bold text-slate-800">
                        INFORME POLICIAL HOMOLOGADO
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Accidentes de Tránsito Terrestre
                      </p>
                    </div>

                    {/* Document Sections */}
                    <Accordion type="single" collapsible defaultValue="datos">
                      <AccordionItem value="datos">
                        <AccordionTrigger className="text-sm font-semibold">
                          I. DATOS GENERALES DEL HECHO
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid gap-4 md:grid-cols-2 p-4 bg-slate-50 rounded-lg">
                            <div>
                              <Label className="text-xs text-slate-500">
                                Fecha del Hecho
                              </Label>
                              <p className="font-medium">15 de Enero de 2024</p>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">
                                Hora
                              </Label>
                              <p className="font-medium">10:45 hrs</p>
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-xs text-slate-500">
                                Lugar de los Hechos
                              </Label>
                              <p className="font-medium">
                                Periférico de Mérida Km 24, Col. Francisco de Montejo
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">
                                Tipo de Siniestro
                              </Label>
                              <p className="font-medium">Colisión múltiple</p>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">
                                Vehículos Involucrados
                              </Label>
                              <p className="font-medium">2</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="narracion">
                        <AccordionTrigger className="text-sm font-semibold">
                          II. NARRACIÓN DE LOS HECHOS
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <Textarea
                              className="min-h-[150px] bg-white"
                              placeholder="Describa detalladamente los hechos ocurridos..."
                              defaultValue="El día 15 de enero de 2024, siendo aproximadamente las 10:45 horas, en el kilómetro 24 del Periférico de Mérida, se suscitó un accidente de tránsito..."
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="vehiculos">
                        <AccordionTrigger className="text-sm font-semibold">
                          III. DATOS DE VEHÍCULOS
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-4">
                            <Card className="bg-slate-50">
                              <CardHeader className="py-3">
                                <CardTitle className="text-sm">
                                  Vehículo 1
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="grid gap-3 md:grid-cols-3 text-sm">
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Marca/Modelo
                                  </Label>
                                  <p className="font-medium">Toyota Corolla 2020</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Placas
                                  </Label>
                                  <p className="font-medium">YUC-123-A</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Color
                                  </Label>
                                  <p className="font-medium">Blanco</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-slate-50">
                              <CardHeader className="py-3">
                                <CardTitle className="text-sm">
                                  Vehículo 2
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="grid gap-3 md:grid-cols-3 text-sm">
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Marca/Modelo
                                  </Label>
                                  <p className="font-medium">Nissan Versa 2019</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Placas
                                  </Label>
                                  <p className="font-medium">YUC-456-B</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-500">
                                    Color
                                  </Label>
                                  <p className="font-medium">Gris</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Generate Button */}
                    <div className="flex justify-center pt-4 border-t">
                      <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                        <FileText className="mr-2 h-5 w-5" />
                        Generar Folio Oficial
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signatures" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5" />
                    Firmas Digitales
                  </CardTitle>
                  <CardDescription>
                    Recolección de firmas para validar el documento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Officer Signature */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Firma del Perito</p>
                          <p className="text-sm text-muted-foreground">
                            Perito Ángel Sánchez
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={signatures.officer ? "default" : "secondary"}
                        className={cn(
                          signatures.officer &&
                            "bg-emerald-500 hover:bg-emerald-600"
                        )}
                      >
                        {signatures.officer ? "Firmado" : "Pendiente"}
                      </Badge>
                    </div>
                    <div
                      className={cn(
                        "h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
                        signatures.officer
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-muted-foreground/30 hover:border-primary/50"
                      )}
                      onClick={() =>
                        setSignatures((prev) => ({
                          ...prev,
                          officer: !prev.officer,
                        }))
                      }
                    >
                      {signatures.officer ? (
                        <div className="text-center">
                          <p className="font-signature text-2xl text-emerald-700">
                            Ángel Sánchez
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            Firmado digitalmente
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Clic para firmar
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Citizen Signatures */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium">Conductor 1</p>
                            <p className="text-sm text-muted-foreground">
                              Juan Pérez García
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={signatures.citizen1 ? "default" : "secondary"}
                          className={cn(
                            signatures.citizen1 &&
                              "bg-emerald-500 hover:bg-emerald-600"
                          )}
                        >
                          {signatures.citizen1 ? "Firmado" : "Pendiente"}
                        </Badge>
                      </div>
                      <div
                        className={cn(
                          "h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
                          signatures.citizen1
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-muted-foreground/30 hover:border-primary/50"
                        )}
                        onClick={() =>
                          setSignatures((prev) => ({
                            ...prev,
                            citizen1: !prev.citizen1,
                          }))
                        }
                      >
                        {signatures.citizen1 ? (
                          <p className="font-signature text-xl text-emerald-700">
                            Juan Pérez
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Clic para firmar
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium">Conductor 2</p>
                            <p className="text-sm text-muted-foreground">
                              María López Ruiz
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={signatures.citizen2 ? "default" : "secondary"}
                          className={cn(
                            signatures.citizen2 &&
                              "bg-emerald-500 hover:bg-emerald-600"
                          )}
                        >
                          {signatures.citizen2 ? "Firmado" : "Pendiente"}
                        </Badge>
                      </div>
                      <div
                        className={cn(
                          "h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
                          signatures.citizen2
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-muted-foreground/30 hover:border-primary/50"
                        )}
                        onClick={() =>
                          setSignatures((prev) => ({
                            ...prev,
                            citizen2: !prev.citizen2,
                          }))
                        }
                      >
                        {signatures.citizen2 ? (
                          <p className="font-signature text-xl text-emerald-700">
                            María López
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Clic para firmar
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">
                          Importante
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          Las firmas digitales tienen validez legal conforme al
                          artículo 89 del Código Nacional de Procedimientos
                          Penales.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Anexos y Multimedia
                  </CardTitle>
                  <CardDescription>
                    Archivos adjuntos al expediente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <Mic className="mr-3 h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Grabar Audio de Entrevista</p>
                      <p className="text-sm text-muted-foreground">
                        Iniciar grabación de declaración
                      </p>
                    </div>
                  </Button>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="rounded bg-primary/10 p-2">
                          <Mic className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Entrevista_Conductor1.mp3
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Duración: 5:34 • 2.3 MB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="rounded bg-primary/10 p-2">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Croquis_Accidente.pdf
                          </p>
                          <p className="text-xs text-muted-foreground">
                            1 página • 156 KB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
