"use client"

import { useEffect, useRef, useState } from "react"
import {
  Sparkles,
  Send,
  RefreshCcw,
  AlertTriangle,
  FileSignature,
  Map,
  Gauge,
  Video,
  Search,
  ShieldCheck,
  Mic,
  UploadCloud,
  Car,
  Ruler,
  Download,
  Info,
  CheckCircle2,
  Copy,
  Save,
  List,
  Plus,
  Trash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api-backend"

async function fetchBackend(path: string, body: any) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "Error al comunicar con el backend")
  }

  return response.json()
}

export function AIAssistant() {
  const [activeTab, setActiveTab] = useState("legal")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [legalQuestion, setLegalQuestion] = useState("")
  const [legalAnswer, setLegalAnswer] = useState("")

  // Estados de Memoria de Conversación e Indicadores
  const [conversationId, setConversationId] = useState<string>("")
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [agentStatus, setAgentStatus] = useState<'idle' | 'searching' | 'inferring'>('idle')
  const [agentStatusMessage, setAgentStatusMessage] = useState<string>("")
  const [metrics, setMetrics] = useState<any>(null)

  const [croquisFotos, setCroquisFotos] = useState("12")
  const [croquisResult, setCroquisResult] = useState("")

  const [velocidadResult, setVelocidadResult] = useState<any>(null)

  const [dictamenResult, setDictamenResult] = useState<any>(null)

  const [videoResult, setVideoResult] = useState<any>(null)

  const [conductoresJson, setConductoresJson] = useState("[]")
  const [vehiculosJson, setVehiculosJson] = useState("[]")
  const [inconsistenciasResult, setInconsistenciasResult] = useState("")

  const [similaresLugar, setSimilaresLugar] = useState("")
  const [similaresTipo, setSimilaresTipo] = useState("")
  const [similaresResult, setSimilaresResult] = useState<any[]>([])
  const [consultaSearch, setConsultaSearch] = useState("")
  const [searchResult, setSearchResult] = useState<any[]>([])

  const [croquisFiles, setCroquisFiles] = useState<File[]>([])
  const [velocidadFile, setVelocidadFile] = useState<File | null>(null)
  const [dictamenFiles, setDictamenFiles] = useState<{ licencia?: File; tarjeta?: File; placa?: File }>({})
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [speechSupported, setSpeechSupported] = useState(false)
  const [recordingLegal, setRecordingLegal] = useState(false)
  const [recordingSearch, setRecordingSearch] = useState(false)
  const [recordingField, setRecordingField] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const activeSpeechFieldRef = useRef<string | null>(null)

  // Estados para el Generador de Informe Guiado
  const [informeSubTab, setInformeSubTab] = useState<'preguntas' | 'formulario' | 'historial'>('preguntas')
  const [informeStep, setInformeStep] = useState(1)
  const [informeAnswers, setInformeAnswers] = useState({
    folio: "ST-2026-0896",
    area: "Tránsito Terrestre",
    fecha: new Date().toISOString().split('T')[0],
    hora: "11:10:00",
    tipo: "Colisión frontal",
    calle_principal: "Calle 50",
    entre_calles: "Calle 60",
    colonia: "Centro",
    punto_referencia: "Frente a comercio local",
    gps: "19.8454, -90.5236",
    cantidad_vehiculos: "2",
    detalles_vehiculos: "Vehículo 1: Nissan Versa, placas YYY-123, presunto responsable. Vehículo 2: Italika 125Z, sin placas, afectado.",
    lesionados: "0",
    fallecidos: "0",
    descripcion_hechos: "El vehículo 1 Nissan Versa transitaba sobre la Calle 50 e invadió el carril contrario al intentar esquivar un obstáculo, colisionando de frente contra el conductor del vehículo 2 que manejaba la motocicleta Italika 125Z."
  })
  const [informeGenerado, setInformeGenerado] = useState<any>(null)
  const [informesGuardados, setInformesGuardados] = useState<any[]>([])
  const [mensajeExito, setMensajeExito] = useState("")

  // Carga/Inicialización de sesión
  useEffect(() => {
    let existingId = localStorage.getItem("siget_chat_session_id")
    if (!existingId) {
      existingId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem("siget_chat_session_id", existingId)
    }
    setConversationId(existingId)
    loadHistory(existingId)
    handleListarInformes()
  }, [])

  async function loadHistory(sessId: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/peritos/asistente-legal/historial/${sessId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.history) {
          setChatHistory(data.history)
        }
      }
    } catch (err) {
      console.warn("No se pudo cargar el historial de chat:", err)
    }
  }

  function handleResetChat() {
    const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem("siget_chat_session_id", newId)
    setConversationId(newId)
    setChatHistory([])
    setLegalAnswer("")
    setLegalQuestion("")
    setMetrics(null)
    setAgentStatus('idle')
    setAgentStatusMessage('')
    setError("")
  }

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-MX'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim()
      if (!transcript) return
      if (activeSpeechFieldRef.current === 'legal') {
        setLegalQuestion((prev) => `${prev} ${transcript}`.trim())
      } else if (activeSpeechFieldRef.current === 'search') {
        setConsultaSearch((prev) => `${prev} ${transcript}`.trim())
      } else if (activeSpeechFieldRef.current && activeSpeechFieldRef.current.startsWith('informe:')) {
        const fieldKey = activeSpeechFieldRef.current.split(':')[1]
        setInformeAnswers((prev: any) => ({
          ...prev,
          [fieldKey]: `${prev[fieldKey] || ''} ${transcript}`.trim()
        }))
      }
    }

    recognition.onerror = (event: any) => {
      setError(event.error || 'Error de reconocimiento de voz')
      setRecordingLegal(false)
      setRecordingSearch(false)
      setRecordingField(null)
      activeSpeechFieldRef.current = null
    }

    recognition.onend = () => {
      setRecordingLegal(false)
      setRecordingSearch(false)
      setRecordingField(null)
      activeSpeechFieldRef.current = null
    }

    recognitionRef.current = recognition
    setSpeechSupported(true)
  }, [])

  async function uploadFiles(path: string, formData: FormData) {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || 'Error al subir archivos')
    }

    return response.json()
  }

  function startSpeech(field: 'legal' | 'search') {
    setError('')
    if (!recognitionRef.current) {
      setError('Reconocimiento de voz no soportado en este navegador.')
      return
    }
    activeSpeechFieldRef.current = field
    if (field === 'legal') setRecordingLegal(true)
    if (field === 'search') setRecordingSearch(true)
    recognitionRef.current.start()
  }

  function stopSpeech() {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
  }

  async function handleLegalAsk() {
    setError("")
    setLegalAnswer("")
    setMetrics(null)
    setLoading(true)
    setAgentStatus("inferring")
    setAgentStatusMessage("Conectando...")

    const questionToSend = legalQuestion.trim()
    if (!questionToSend) return

    const updatedHistory = [...chatHistory, { role: "user", content: questionToSend }]
    setChatHistory(updatedHistory)
    setLegalQuestion("")

    try {
      const response = await fetch(`${BACKEND_URL}/api/peritos/asistente-legal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pregunta: questionToSend,
          conversation_id: conversationId
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Error al comunicarse con el asistente.")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No se pudo iniciar el canal de streaming.")
      }

      const decoder = new TextDecoder()
      let buffer = ""
      let fullResponseText = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data: ")) continue

          const jsonStr = trimmed.slice(6)
          try {
            const data = JSON.parse(jsonStr)

            if (data.status) {
              if (data.status === "searching_rules") {
                setAgentStatus("searching")
                setAgentStatusMessage(data.message || "Buscando reglamento...")
              } else if (data.status === "searching_accidents") {
                setAgentStatus("searching")
                setAgentStatusMessage(data.message || "Buscando casos similares...")
              } else if (data.status === "inferring") {
                setAgentStatus("inferring")
                setAgentStatusMessage(data.message || "Generando respuesta...")
              } else if (data.status === "done") {
                setAgentStatus("idle")
                setAgentStatusMessage("")
                if (data.metrics) {
                  setMetrics(data.metrics)
                }
                if (data.conversation_id) {
                  setConversationId(data.conversation_id)
                  localStorage.setItem("siget_chat_session_id", data.conversation_id)
                }
              }
            } else if (data.token) {
              setAgentStatus("inferring")
              fullResponseText += data.token
              setLegalAnswer(fullResponseText)
            } else if (data.error) {
              setError(data.error)
            }
          } catch (e) {
            // ignorar errores de JSON parsing parcial
          }
        }
      }

      if (fullResponseText) {
        setChatHistory((prev) => [...prev, { role: "assistant", content: fullResponseText }])
        setLegalAnswer("")
      }

    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error inesperado")
      setLegalQuestion(questionToSend) // Restaurar pregunta para reintento
    } finally {
      setLoading(false)
      setAgentStatus("idle")
      setAgentStatusMessage("")
    }
  }

  async function handleCroquis3D() {
    setError("")
    setCroquisResult("")
    setLoading(true)
    try {
      const formData = new FormData()
      croquisFiles.forEach((file) => formData.append('photos', file))
      formData.append('numero_fotos', String(croquisFotos))
      const data = await uploadFiles('/api/peritos/croquis-3d/upload', formData)
      setCroquisResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  async function handleVelocidad() {
    setError("")
    setVelocidadResult("")
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('huella', velocidadFile!)
      const data = await uploadFiles('/api/peritos/velocidad-huellas/upload', formData)
      setVelocidadResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  async function handleDictamenPrellenado() {
    setError("")
    setDictamenResult(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('licencia', dictamenFiles.licencia!)
      formData.append('tarjeta', dictamenFiles.tarjeta!)
      formData.append('placa', dictamenFiles.placa!)
      const data = await uploadFiles('/api/dictamen/prellenado/upload', formData)
      setDictamenResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalizarVideo() {
    setError("")
    setVideoResult(null)
    setLoading(true)
    try {
      if (!videoFile) {
        throw new Error("No se ha cargado un archivo de video")
      }

      const formData = new FormData()
      formData.append('video', videoFile)
      const data = await uploadFiles('/api/peritos/analizar-video/upload', formData)
      setVideoResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  async function handleDetectarInconsistencias() {
    setError("")
    setInconsistenciasResult("")
    setLoading(true)
    try {
      const conductores = JSON.parse(conductoresJson)
      const vehiculos = JSON.parse(vehiculosJson)
      const data = await fetchBackend("/api/dictamen/inconsistencias", {
        conductores,
        vehiculos
      })
      setInconsistenciasResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  async function handleBuscarSimilares() {
    setError("")
    setSimilaresResult([])
    setLoading(true)
    try {
      const data = await fetch(`${BACKEND_URL}/api/dictamen/similares?lugar=${encodeURIComponent(similaresLugar)}&tipo=${encodeURIComponent(similaresTipo)}`)
      if (!data.ok) {
        const text = await data.text()
        throw new Error(text || "Error al buscar similares")
      }
      const json = await data.json()
      setSimilaresResult(json.similares || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  async function handleBuscarConsulta() {
    setError("")
    setSearchResult([])
    setLoading(true)
    try {
      const data = await fetchBackend("/api/dictamen/buscar", {
        consulta: consultaSearch,
        limite: 5
      })
      setSearchResult(data.resultados || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  function toggleSpeechField(fieldName: string) {
    if (!recognitionRef.current) return
    
    if (recordingField === fieldName) {
      recognitionRef.current.stop()
      setRecordingField(null)
      activeSpeechFieldRef.current = null
    } else {
      setError('')
      setRecordingField(fieldName)
      activeSpeechFieldRef.current = `informe:${fieldName}`
      recognitionRef.current.start()
    }
  }

  async function handleGenerarInforme() {
    setError("")
    setMensajeExito("")
    setLoading(true)
    setInformeGenerado(null)
    
    const notesText = `
Folio del siniestro: ${informeAnswers.folio}
Área responsable: ${informeAnswers.area}
Fecha del incidente: ${informeAnswers.fecha}
Hora del incidente: ${informeAnswers.hora}
Tipo de siniestro: ${informeAnswers.tipo}
Ubicación del hecho:
- Calle Principal: ${informeAnswers.calle_principal}
- Entre Calles: ${informeAnswers.entre_calles}
- Colonia/Fraccionamiento: ${informeAnswers.colonia}
- Punto de referencia: ${informeAnswers.punto_referencia}
- Coordenadas GPS: ${informeAnswers.gps}
Vehículos involucrados:
- Cantidad: ${informeAnswers.cantidad_vehiculos}
- Detalles: ${informeAnswers.detalles_vehiculos}
Saldo de personas:
- Lesionados: ${informeAnswers.lesionados}
- Fallecidos: ${informeAnswers.fallecidos}
Descripción detallada de los hechos: ${informeAnswers.descripcion_hechos}
`.trim();

    try {
      const response = await fetch(`${BACKEND_URL}/api/dictamen/generar-informe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ notas: notesText })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Error al procesar el informe con la IA.");
      }

      const data = await response.json();
      setInformeGenerado(data);
      setInformeSubTab('formulario');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comunicarse con la IA.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuardarInforme() {
    setError("")
    setMensajeExito("")
    if (!informeGenerado) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/dictamen/guardar-informe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ informe: informeGenerado })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Error al guardar el informe.");
      }

      const data = await response.json();
      setMensajeExito(data.message || "Informe guardado exitosamente en SQLite.");
      await handleListarInformes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleListarInformes() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dictamen/informes`);
      if (response.ok) {
        const data = await response.json();
        setInformesGuardados(data.informes || []);
      }
    } catch (err) {
      console.warn("No se pudieron listar los informes:", err);
    }
  }

  const updateVehicle = (index: number, key: string, val: any) => {
    setInformeGenerado((prev: any) => {
      const newDetalles = [...prev.vehiculos_involucrados.detalle_vehiculos];
      newDetalles[index] = { ...newDetalles[index], [key]: val };
      return {
        ...prev,
        vehiculos_involucrados: {
          ...prev.vehiculos_involucrados,
          detalle_vehiculos: newDetalles
        }
      };
    });
  }

  const updateGeneralField = (category: string, key: string, val: any) => {
    setInformeGenerado((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: val
      }
    }));
  }

  let croquisData: any = null;
  try {
    if (croquisResult) {
      const outer = JSON.parse(croquisResult);
      if (outer && outer.croquis) {
        croquisData = typeof outer.croquis === "string" ? JSON.parse(outer.croquis) : outer.croquis;
      } else {
        croquisData = outer;
      }
    }
  } catch (e) {
    console.error("Error parsing croquisResult:", e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Asistente IA SIGET</h1>
        <p className="text-muted-foreground">
          Accede a las funciones de IA para peritos: croquis 3D, dictamen prellenado, análisis de video, inconsistencia y más.
        </p>
      </div>

      <Tabs defaultValue="legal" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg">
          <TabsTrigger value="legal">Asistente Legal</TabsTrigger>
          <TabsTrigger value="informe">Levantar Informe</TabsTrigger>
          <TabsTrigger value="croquis">Croquis 3D</TabsTrigger>
          <TabsTrigger value="velocidad">Velocidad</TabsTrigger>
          <TabsTrigger value="dictamen">Dictamen</TabsTrigger>
          <TabsTrigger value="video">Video C5i</TabsTrigger>
          <TabsTrigger value="inconsistencias">Inconsistencias</TabsTrigger>
          <TabsTrigger value="similares">Banco Dictámenes</TabsTrigger>
        </TabsList>

        <TabsContent value="legal" className="space-y-6 pt-4">
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Sparkles className="h-5 w-5 text-indigo-500" /> Asistente Legal Vial
                  </CardTitle>
                  <CardDescription>
                    Interacción inteligente en tiempo real y persistencia con SQLite
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetChat}
                  className="text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                >
                  <RefreshCcw className="h-3.5 w-3.5" /> Nuevo Hilo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
              {/* Contenedor del Historial de Conversación */}
              <div className="rounded-xl border border-border bg-muted/10 p-4 max-h-[420px] overflow-y-auto space-y-4 shadow-inner min-h-[250px] flex flex-col">
                {chatHistory.length === 0 && !legalAnswer && !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 my-auto">
                    <Sparkles className="h-10 w-10 text-muted-foreground/60 animate-pulse" />
                    <div>
                      <h3 className="font-semibold text-foreground/80">Asistente IA Invocado</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mt-1">
                        Escribe una consulta sobre el Reglamento de Tránsito de Yucatán o incidentes del banco de dictámenes.
                      </p>
                    </div>
                  </div>
                )}
                
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-card text-card-foreground border border-border/80 rounded-tl-none'
                      }`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${
                        msg.role === 'user' ? 'text-primary-foreground/75 text-right' : 'text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {msg.role === 'user' ? 'Perito' : 'Asistente IA'}
                      </p>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))}

                {/* Respuesta en Streaming (Live) */}
                {legalAnswer && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card text-card-foreground border border-border/80 rounded-tl-none shadow-sm">
                      <p className="text-xs font-semibold mb-1 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-yellow-500 animate-spin" /> Asistente IA (Generando...)
                      </p>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{legalAnswer}</div>
                    </div>
                  </div>
                )}

                {/* Estado dinámico del agente */}
                {loading && agentStatus !== 'idle' && (
                  <div className="flex justify-start">
                    <div className="rounded-xl px-3.5 py-2.5 bg-accent/30 text-accent-foreground border border-accent/40 shadow-sm animate-pulse flex items-center gap-2.5 text-xs font-medium">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span>{agentStatusMessage}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel de Métricas de Observabilidad Local */}
              {metrics && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex flex-wrap items-center justify-around gap-4 text-xs text-emerald-800 dark:text-emerald-400 font-mono shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">TTFT:</span>
                    <span>{metrics.ttft} ms</span>
                  </div>
                  <div className="h-3 w-[1px] bg-emerald-500/20 hidden md:block"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">Latencia Total:</span>
                    <span>{(metrics.latency / 1000).toFixed(2)} s</span>
                  </div>
                  <div className="h-3 w-[1px] bg-emerald-500/20 hidden md:block"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">Velocidad:</span>
                    <span>{metrics.tps} tok/s</span>
                  </div>
                </div>
              )}

              {/* Formulario de Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    id="legal-question"
                    value={legalQuestion}
                    onChange={(e) => setLegalQuestion(e.target.value)}
                    placeholder="Escribe tu consulta aquí (ej. ¿Quién tiene preferencia en una intersección de Yucatán sin señalamientos?)..."
                    className="pr-12 min-h-[90px] rounded-xl border-border/80 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (legalQuestion.trim() && !loading) {
                          handleLegalAsk();
                        }
                      }
                    }}
                  />
                  
                  {/* Botón de Grabación (STT) integrado de forma compacta */}
                  {speechSupported && (
                    <Button
                      type="button"
                      variant={recordingLegal ? 'destructive' : 'ghost'}
                      size="icon"
                      onClick={() => recordingLegal ? stopSpeech() : startSpeech('legal')}
                      className={`absolute right-3 bottom-3 h-8 w-8 rounded-lg transition-all duration-300 ${
                        recordingLegal 
                          ? 'animate-pulse bg-rose-600 text-white shadow-md shadow-rose-500/30' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      disabled={loading}
                      title={recordingLegal ? "Detener grabación de voz" : "Dictar pregunta por voz"}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <Button 
                    onClick={handleLegalAsk} 
                    disabled={!legalQuestion.trim() || loading}
                    className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
                  >
                    <Send className="mr-2 h-4 w-4" /> Consultar
                  </Button>
                </div>
              </div>

              {!speechSupported && (
                <p className="text-[11px] text-muted-foreground">Nota: El navegador no tiene soporte nativo de voz.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="informe" className="space-y-6 pt-4">
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <FileSignature className="h-5.5 w-5.5 text-indigo-600" /> Generador de Informe Guiado
                  </CardTitle>
                  <CardDescription>
                    Levanta el reporte vial respondiendo preguntas sencillas paso a paso, con dictado por voz y base de datos SQLite.
                  </CardDescription>
                </div>
                {/* Botones de navegación de sub-pestañas */}
                <div className="flex gap-1.5 bg-muted p-1 rounded-xl text-xs font-medium border border-border/40">
                  <Button
                    variant={informeSubTab === 'preguntas' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setInformeSubTab('preguntas')}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" /> 1. Recopilar Datos
                  </Button>
                  <Button
                    variant={informeSubTab === 'formulario' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setInformeSubTab('formulario')}
                  >
                    <FileSignature className="h-3.5 w-3.5 mr-1 text-emerald-500" /> 2. Formulario y JSON
                  </Button>
                  <Button
                    variant={informeSubTab === 'historial' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                    onClick={() => {
                      setInformeSubTab('historial');
                      handleListarInformes();
                    }}
                  >
                    <List className="h-3.5 w-3.5 mr-1 text-amber-500" /> 3. Historial Guardado
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* SUB-TAB: PREGUNTAS (STEPPER) */}
              {informeSubTab === 'preguntas' && (
                <div className="space-y-6">
                  {/* Stepper Visual */}
                  <div className="flex items-center justify-between max-w-xl mx-auto mb-8">
                    {[1, 2, 3, 4, 5].map((step) => {
                      const labels = ["General", "Tiempo", "Ubicación", "Vehículos", "Notas"];
                      const isActive = informeStep === step;
                      const isCompleted = informeStep > step;
                      return (
                        <div key={step} className="flex flex-col items-center flex-1 relative">
                          {/* Línea de conexión */}
                          {step > 1 && (
                            <div className={`absolute top-4 right-1/2 left-[-50%] h-[2px] -translate-y-1/2 z-0 ${
                              isCompleted ? 'bg-indigo-600' : 'bg-border/60'
                            }`} />
                          )}
                          <button
                            type="button"
                            onClick={() => setInformeStep(step)}
                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                              isActive 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-110'
                                : isCompleted
                                ? 'bg-indigo-50/80 border-indigo-500 text-indigo-600'
                                : 'bg-background border-border/80 text-muted-foreground'
                            }`}
                          >
                            {isCompleted ? "✓" : step}
                          </button>
                          <span className={`text-[10px] font-semibold mt-2 ${
                            isActive ? 'text-indigo-600 font-bold' : 'text-muted-foreground'
                          }`}>
                            {labels[step-1]}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Preguntas de cada Paso */}
                  <div className="max-w-2xl mx-auto bg-muted/10 p-5 rounded-2xl border border-border/60 space-y-4">
                    {informeStep === 1 && (
                      <div className="space-y-4">
                        <div className="border-b border-border/40 pb-2 mb-2">
                          <h3 className="font-bold text-base text-foreground">Paso 1: Datos Generales</h3>
                          <p className="text-xs text-muted-foreground">Establece el folio oficial de seguimiento y el área encargada.</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="q-folio">Folio del Siniestro</Label>
                          <div className="relative">
                            <Input
                              id="q-folio"
                              placeholder="Ej. ST-2026-0896"
                              value={informeAnswers.folio}
                              onChange={(e) => setInformeAnswers(prev => ({ ...prev, folio: e.target.value }))}
                              disabled={loading}
                              className="pr-10"
                            />
                            {speechSupported && (
                              <Button
                                type="button"
                                variant={recordingField === 'folio' ? 'destructive' : 'ghost'}
                                size="icon"
                                onClick={() => toggleSpeechField('folio')}
                                className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                                disabled={loading}
                              >
                                <Mic className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="q-area">Área Responsable</Label>
                          <div className="relative">
                            <Input
                              id="q-area"
                              placeholder="Ej. Tránsito Terrestre"
                              value={informeAnswers.area}
                              onChange={(e) => setInformeAnswers(prev => ({ ...prev, area: e.target.value }))}
                              disabled={loading}
                              className="pr-10"
                            />
                            {speechSupported && (
                              <Button
                                type="button"
                                variant={recordingField === 'area' ? 'destructive' : 'ghost'}
                                size="icon"
                                onClick={() => toggleSpeechField('area')}
                                className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                                disabled={loading}
                              >
                                <Mic className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {informeStep === 2 && (
                      <div className="space-y-4">
                        <div className="border-b border-border/40 pb-2 mb-2">
                          <h3 className="font-bold text-base text-foreground">Paso 2: Fecha y Hora</h3>
                          <p className="text-xs text-muted-foreground">Establece el momento exacto en el que ocurrió el incidente vial.</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="q-fecha">Fecha del Siniestro</Label>
                          <Input
                            id="q-fecha"
                            type="date"
                            value={informeAnswers.fecha}
                            onChange={(e) => setInformeAnswers(prev => ({ ...prev, fecha: e.target.value }))}
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="q-hora">Hora del Siniestro</Label>
                          <Input
                            id="q-hora"
                            type="time"
                            value={informeAnswers.hora}
                            onChange={(e) => setInformeAnswers(prev => ({ ...prev, hora: e.target.value }))}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {informeStep === 3 && (
                      <div className="space-y-4">
                        <div className="border-b border-border/40 pb-2 mb-2">
                          <h3 className="font-bold text-base text-foreground">Paso 3: Tipo y Ubicación</h3>
                          <p className="text-xs text-muted-foreground">Ingresa qué tipo de choque ocurrió y los detalles del lugar de los hechos.</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="q-tipo">Tipo de Siniestro</Label>
                          <div className="relative">
                            <Input
                              id="q-tipo"
                              placeholder="Ej. Colisión frontal, alcance, atropellamiento"
                              value={informeAnswers.tipo}
                              onChange={(e) => setInformeAnswers(prev => ({ ...prev, tipo: e.target.value }))}
                              disabled={loading}
                              className="pr-10"
                            />
                            {speechSupported && (
                              <Button
                                type="button"
                                variant={recordingField === 'tipo' ? 'destructive' : 'ghost'}
                                size="icon"
                                onClick={() => toggleSpeechField('tipo')}
                                className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                                disabled={loading}
                              >
                                <Mic className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="q-calle">Calle Principal</Label>
                            <div className="relative">
                              <Input
                                id="q-calle"
                                placeholder="Ej. Calle 50"
                                value={informeAnswers.calle_principal}
                                onChange={(e) => setInformeAnswers(prev => ({ ...prev, calle_principal: e.target.value }))}
                                disabled={loading}
                                className="pr-10"
                              />
                              {speechSupported && (
                                <Button
                                  type="button"
                                  variant={recordingField === 'calle_principal' ? 'destructive' : 'ghost'}
                                  size="icon"
                                  onClick={() => toggleSpeechField('calle_principal')}
                                  className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                                  disabled={loading}
                                >
                                  <Mic className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="q-entre">Entre Calles</Label>
                            <div className="relative">
                              <Input
                                id="q-entre"
                                placeholder="Ej. Calle 60"
                                value={informeAnswers.entre_calles}
                                onChange={(e) => setInformeAnswers(prev => ({ ...prev, entre_calles: e.target.value }))}
                                disabled={loading}
                                className="pr-10"
                              />
                              {speechSupported && (
                                <Button
                                  type="button"
                                  variant={recordingField === 'entre_calles' ? 'destructive' : 'ghost'}
                                  size="icon"
                                  onClick={() => toggleSpeechField('entre_calles')}
                                  className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                                  disabled={loading}
                                >
                                  <Mic className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="q-colonia">Colonia / Fraccionamiento</Label>
                            <div className="relative">
                              <Input
                                id="q-colonia"
                                placeholder="Ej. Centro"
                                value={informeAnswers.colonia}
                                onChange={(e) => setInformeAnswers(prev => ({ ...prev, colonia: e.target.value }))}
                                disabled={loading}
                                className="pr-10"
                              />
                              {speechSupported && (
                                <Button
                                  type="button"
                                  variant={recordingField === 'colonia' ? 'destructive' : 'ghost'}
                                  size="icon"
                                  onClick={() => toggleSpeechField('colonia')}
                                  className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                                  disabled={loading}
                                >
                                  <Mic className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="q-gps">Coordenadas GPS</Label>
                            <div className="relative">
                              <Input
                                id="q-gps"
                                placeholder="19.8454, -90.5236"
                                value={informeAnswers.gps}
                                onChange={(e) => setInformeAnswers(prev => ({ ...prev, gps: e.target.value }))}
                                disabled={loading}
                                className="pr-10"
                              />
                              {speechSupported && (
                                <Button
                                  type="button"
                                  variant={recordingField === 'gps' ? 'destructive' : 'ghost'}
                                  size="icon"
                                  onClick={() => toggleSpeechField('gps')}
                                  className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                                  disabled={loading}
                                >
                                  <Mic className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="q-ref">Punto de Referencia</Label>
                          <div className="relative">
                            <Input
                              id="q-ref"
                              placeholder="Ej. Frente a comercio local"
                              value={informeAnswers.punto_referencia}
                              onChange={(e) => setInformeAnswers(prev => ({ ...prev, punto_referencia: e.target.value }))}
                              disabled={loading}
                              className="pr-10"
                            />
                            {speechSupported && (
                              <Button
                                type="button"
                                variant={recordingField === 'punto_referencia' ? 'destructive' : 'ghost'}
                                size="icon"
                                onClick={() => toggleSpeechField('punto_referencia')}
                                className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                                disabled={loading}
                              >
                                <Mic className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {informeStep === 4 && (
                      <div className="space-y-4">
                        <div className="border-b border-border/40 pb-2 mb-2">
                          <h3 className="font-bold text-base text-foreground">Paso 4: Vehículos Involucrados</h3>
                          <p className="text-xs text-muted-foreground">Describe cuántos autos o motos participaron y las características de cada uno.</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="q-cant-veh">Cantidad de Vehículos</Label>
                          <Input
                            id="q-cant-veh"
                            type="number"
                            value={informeAnswers.cantidad_vehiculos}
                            onChange={(e) => setInformeAnswers(prev => ({ ...prev, cantidad_vehiculos: e.target.value }))}
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="q-det-veh">Detalles de los Vehículos (Marcas, Modelos, Placas, Roles)</Label>
                          <div className="relative">
                            <Textarea
                              id="q-det-veh"
                              placeholder="Ej. Vehículo 1: Nissan Versa placas YYY-123 presunto responsable; Vehículo 2: Italika 125Z sin placas afectado."
                              rows={5}
                              value={informeAnswers.detalles_vehiculos}
                              onChange={(e) => setInformeAnswers(prev => ({ ...prev, detalles_vehiculos: e.target.value }))}
                              className="pr-10 rounded-xl"
                              disabled={loading}
                            />
                            {speechSupported && (
                              <Button
                                type="button"
                                variant={recordingField === 'detalles_vehiculos' ? 'destructive' : 'ghost'}
                                size="icon"
                                onClick={() => toggleSpeechField('detalles_vehiculos')}
                                className="absolute right-3 bottom-3 h-8 w-8 rounded-lg"
                                disabled={loading}
                              >
                                <Mic className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {informeStep === 5 && (
                      <div className="space-y-4">
                        <div className="border-b border-border/40 pb-2 mb-2">
                          <h3 className="font-bold text-base text-foreground">Paso 5: Saldo y Descripción de los Hechos</h3>
                          <p className="text-xs text-muted-foreground">Indica si hubo heridos o muertes, y redacta una breve nota descriptiva.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="q-les">Personas Lesionadas</Label>
                            <Input
                              id="q-les"
                              type="number"
                              value={informeAnswers.lesionados}
                              onChange={(e) => setInformeAnswers(prev => ({ ...prev, lesionados: e.target.value }))}
                              disabled={loading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="q-fal">Personas Fallecidas</Label>
                            <Input
                              id="q-fal"
                              type="number"
                              value={informeAnswers.fallecidos}
                              onChange={(e) => setInformeAnswers(prev => ({ ...prev, fallecidos: e.target.value }))}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="q-hechos">Descripción de los Hechos / Notas Libres del Agente</Label>
                          <div className="relative">
                            <Textarea
                              id="q-hechos"
                              placeholder="Ej. El Versa invadió carril contrario impactando de frente a la motocicleta..."
                              rows={5}
                              value={informeAnswers.descripcion_hechos}
                              onChange={(e) => setInformeAnswers(prev => ({ ...prev, descripcion_hechos: e.target.value }))}
                              className="pr-10 rounded-xl"
                              disabled={loading}
                            />
                            {speechSupported && (
                              <Button
                                type="button"
                                variant={recordingField === 'descripcion_hechos' ? 'destructive' : 'ghost'}
                                size="icon"
                                onClick={() => toggleSpeechField('descripcion_hechos')}
                                className="absolute right-3 bottom-3 h-8 w-8 rounded-lg"
                                disabled={loading}
                              >
                                <Mic className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botones de control del formulario guiado */}
                    <div className="flex justify-between items-center pt-4 border-t border-border/40">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setInformeStep(prev => Math.max(1, prev - 1))}
                        disabled={informeStep === 1 || loading}
                        className="rounded-xl px-4"
                      >
                        Atrás
                      </Button>
                      
                      {informeStep < 5 ? (
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => setInformeStep(prev => Math.min(5, prev + 1))}
                          className="rounded-xl px-4 font-medium"
                          disabled={loading}
                        >
                          Siguiente
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleGenerarInforme}
                          className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Generando reporte...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" /> Generar con IA
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB: FORMULARIO Y JSON */}
              {informeSubTab === 'formulario' && (
                <div className="space-y-6">
                  {!informeGenerado ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 max-w-md mx-auto">
                      <FileSignature className="h-12 w-12 text-muted-foreground/50 animate-pulse" />
                      <div>
                        <h3 className="font-bold text-lg text-foreground/80">Falta Generar el Reporte</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Primero completa las 5 etapas en la pestaña <strong>"1. Recopilar Datos"</strong> y haz clic en "Generar con IA".
                        </p>
                      </div>
                      <Button onClick={() => setInformeSubTab('preguntas')} className="rounded-xl bg-indigo-600 text-white">
                        Ir a Recopilar Datos
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* COLUMNA IZQUIERDA: Formulario Interactivo (v-model style bindings) */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="border border-border/80 rounded-2xl bg-muted/5 p-5 space-y-6">
                          <div className="border-b border-border/50 pb-3 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-foreground flex items-center gap-1.5">
                              <FileSignature className="h-5 w-5 text-emerald-500" /> Revisión y Edición del Formulario
                            </h3>
                            <span className="text-xs bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Editando en Vivo
                            </span>
                          </div>

                          {/* Sección 1: Datos Generales */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                              Datos Generales
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="f-folio">Folio</Label>
                                <Input
                                  id="f-folio"
                                  value={informeGenerado.datos_generales.folio}
                                  onChange={(e) => updateGeneralField('datos_generales', 'folio', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="f-area">Área</Label>
                                <Input
                                  id="f-area"
                                  value={informeGenerado.datos_generales.area}
                                  onChange={(e) => updateGeneralField('datos_generales', 'area', e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="f-fecha">Fecha del Siniestro</Label>
                                <Input
                                  id="f-fecha"
                                  type="date"
                                  value={informeGenerado.datos_generales.fecha_siniestro}
                                  onChange={(e) => updateGeneralField('datos_generales', 'fecha_siniestro', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="f-hora">Hora</Label>
                                <Input
                                  id="f-hora"
                                  type="text"
                                  value={informeGenerado.datos_generales.hora_siniestro}
                                  onChange={(e) => updateGeneralField('datos_generales', 'hora_siniestro', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="f-tipo">Tipo de Siniestro</Label>
                                <Input
                                  id="f-tipo"
                                  value={informeGenerado.datos_generales.tipo_siniestro}
                                  onChange={(e) => updateGeneralField('datos_generales', 'tipo_siniestro', e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="f-hechos">Descripción de Hechos</Label>
                              <Textarea
                                id="f-hechos"
                                rows={4}
                                value={informeGenerado.datos_generales.descripcion_hechos}
                                onChange={(e) => updateGeneralField('datos_generales', 'descripcion_hechos', e.target.value)}
                                className="rounded-xl text-sm"
                              />
                            </div>
                          </div>

                          <div className="border-t border-border/40 my-4" />

                          {/* Sección 2: Ubicación */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                              Ubicación del Accidente
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="f-calle">Calle Principal</Label>
                                <Input
                                  id="f-calle"
                                  value={informeGenerado.ubicacion.calle_principal}
                                  onChange={(e) => updateGeneralField('ubicacion', 'calle_principal', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="f-entre">Entre Calles</Label>
                                <Input
                                  id="f-entre"
                                  value={informeGenerado.ubicacion.entre_calles}
                                  onChange={(e) => updateGeneralField('ubicacion', 'entre_calles', e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="f-colonia">Colonia o Fraccionamiento</Label>
                                <Input
                                  id="f-colonia"
                                  value={informeGenerado.ubicacion.colonia_fraccionamiento}
                                  onChange={(e) => updateGeneralField('ubicacion', 'colonia_fraccionamiento', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="f-gps">Coordenadas GPS</Label>
                                <Input
                                  id="f-gps"
                                  value={informeGenerado.ubicacion.coordenadas_gps}
                                  onChange={(e) => updateGeneralField('ubicacion', 'coordenadas_gps', e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="f-ref">Punto de Referencia</Label>
                              <Input
                                id="f-ref"
                                value={informeGenerado.ubicacion.punto_referencia}
                                onChange={(e) => updateGeneralField('ubicacion', 'punto_referencia', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="border-t border-border/40 my-4" />

                          {/* Sección 3: Vehículos */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                Vehículos Involucrados ({informeGenerado.vehiculos_involucrados.cantidad_vehiculos})
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                className="h-7 text-[11px] rounded-lg flex items-center gap-1 hover:bg-indigo-50 hover:text-indigo-600"
                                onClick={() => {
                                  const nextId = informeGenerado.vehiculos_involucrados.detalle_vehiculos.length + 1;
                                  const newVehicles = [...informeGenerado.vehiculos_involucrados.detalle_vehiculos, {
                                    id_vehiculo: nextId,
                                    marca: "Nissan",
                                    modelo: "Versa",
                                    placas: "No especificado",
                                    tipo_participacion: "Involucrado"
                                  }];
                                  setInformeGenerado((prev: any) => ({
                                    ...prev,
                                    vehiculos_involucrados: {
                                      cantidad_vehiculos: newVehicles.length,
                                      detalle_vehiculos: newVehicles
                                    }
                                  }));
                                }}
                              >
                                <Plus className="h-3 w-3" /> Agregar Vehículo
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              {informeGenerado.vehiculos_involucrados.detalle_vehiculos.map((veh: any, idx: number) => (
                                <Card key={idx} className="border border-border p-4 rounded-xl relative shadow-sm hover:border-indigo-500/30 transition-colors bg-muted/5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newVehicles = informeGenerado.vehiculos_involucrados.detalle_vehiculos.filter((_: any, i: number) => i !== idx);
                                      setInformeGenerado((prev: any) => ({
                                        ...prev,
                                        vehiculos_involucrados: {
                                          cantidad_vehiculos: newVehicles.length,
                                          detalle_vehiculos: newVehicles
                                        }
                                      }));
                                    }}
                                    className="absolute top-3 right-3 text-muted-foreground hover:text-rose-600 transition-colors"
                                    title="Remover vehículo"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </button>
                                  
                                  <h5 className="font-bold text-xs text-indigo-500 uppercase tracking-wider mb-3">
                                    Vehículo #{veh.id_vehiculo || idx + 1}
                                  </h5>

                                  <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Marca</Label>
                                      <Input
                                        className="h-8 text-xs"
                                        value={veh.marca}
                                        onChange={(e) => updateVehicle(idx, 'marca', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Modelo</Label>
                                      <Input
                                        className="h-8 text-xs"
                                        value={veh.modelo}
                                        onChange={(e) => updateVehicle(idx, 'modelo', e.target.value)}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Placas</Label>
                                      <Input
                                        className="h-8 text-xs"
                                        value={veh.placas}
                                        onChange={(e) => updateVehicle(idx, 'placas', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Participación</Label>
                                      <select
                                        className="w-full h-8 text-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={veh.tipo_participacion}
                                        onChange={(e) => updateVehicle(idx, 'tipo_participacion', e.target.value)}
                                      >
                                        <option value="Presunto responsable">Presunto responsable</option>
                                        <option value="Afectado">Afectado</option>
                                        <option value="Involucrado">Involucrado</option>
                                      </select>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-border/40 my-4" />

                          {/* Sección 4: Saldo */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                              Saldo de Afectados
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="f-les">Lesionados</Label>
                                <Input
                                  id="f-les"
                                  type="number"
                                  value={informeGenerado.saldo_involucrados.personas_lesionadas}
                                  onChange={(e) => updateGeneralField('saldo_involucrados', 'personas_lesionadas', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="f-fal">Fallecidos</Label>
                                <Input
                                  id="f-fal"
                                  type="number"
                                  value={informeGenerado.saldo_involucrados.personas_fallecidas}
                                  onChange={(e) => updateGeneralField('saldo_involucrados', 'personas_fallecidas', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* COLUMNA DERECHA: Vista JSON, Copiar y Guardar */}
                      <div className="lg:col-span-5 space-y-4 sticky top-4">
                        <Card className="border border-border/80 shadow-md">
                          <CardHeader className="bg-muted/10 border-b border-border/40 py-3.5 flex justify-between items-center">
                            <div>
                              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                                <Sparkles className="h-4.5 w-4.5 text-indigo-500" /> Vista del JSON Estructurado
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 space-y-4">
                            <div className="rounded-xl border border-border bg-slate-950 p-4 max-h-[480px] overflow-y-auto font-mono text-[11px] text-emerald-400 leading-relaxed shadow-inner">
                              <pre className="whitespace-pre">{JSON.stringify(informeGenerado, null, 2)}</pre>
                            </div>
                            
                            {/* Botones de Acción */}
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                type="button"
                                className="w-full rounded-xl flex items-center justify-center gap-2 text-xs font-semibold"
                                onClick={() => {
                                  navigator.clipboard.writeText(JSON.stringify(informeGenerado, null, 2));
                                  setMensajeExito("¡JSON copiado en el portapapeles con éxito!");
                                  setTimeout(() => setMensajeExito(""), 4000);
                                }}
                              >
                                <Copy className="h-4 w-4" /> Copiar JSON al Portapapeles
                              </Button>
                              
                              <Button
                                type="button"
                                className="w-full rounded-xl flex items-center justify-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25"
                                onClick={handleGuardarInforme}
                                disabled={loading}
                              >
                                <Save className="h-4 w-4" /> Guardar Informe en SQLite
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {mensajeExito && (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                            <span>{mensajeExito}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB: HISTORIAL */}
              {informeSubTab === 'historial' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-border/40 pb-3">
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <List className="h-5 w-5 text-amber-500" /> Registro de Informes Guardados en SQLite
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Visualiza, carga y edita los reportes estructurados que han sido guardados previamente.
                    </p>
                  </div>

                  {informesGuardados.length === 0 ? (
                    <div className="text-center p-12 text-muted-foreground border border-dashed border-border rounded-xl max-w-sm mx-auto">
                      <List className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2 animate-pulse" />
                      <p className="font-semibold text-sm">No hay informes en el historial.</p>
                      <p className="text-xs mt-1">Genera un nuevo informe y guárdalo para verlo aquí listado.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {informesGuardados.map((inf, idx) => (
                        <Card key={idx} className="border border-border/80 hover:border-indigo-500/40 shadow-sm transition-all duration-300 hover:shadow-md bg-muted/5 flex flex-col justify-between">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                {inf.folio}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                {new Date(inf.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <CardTitle className="text-sm font-bold text-foreground">
                              {inf.tipo_siniestro}
                            </CardTitle>
                            <CardDescription className="text-xs font-medium">
                              Área: {inf.area}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-1 space-y-4 flex-1 flex flex-col justify-between">
                            <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                              {inf.datos_completos?.datos_generales?.descripcion_hechos || inf.descripcion_hechos}
                            </p>
                            
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="w-full text-xs font-semibold rounded-lg h-8 flex items-center justify-center gap-1.5"
                              onClick={() => {
                                setInformeGenerado(inf.datos_completos || inf);
                                setInformeSubTab('formulario');
                              }}
                            >
                              <FileSignature className="h-3.5 w-3.5 text-emerald-500" /> Cargar en Formulario
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="croquis" className="space-y-6 pt-4">
          <Card className="border border-border/80 shadow-md">
            <CardHeader className="bg-muted/15 border-b border-border/40 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Map className="h-5.5 w-5.5 text-indigo-500" /> Croquis 3D Automático
              </CardTitle>
              <CardDescription>
                Genera un croquis 3D interactivo y listado de detalles a partir de fotos de evidencia.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Formulario de Carga */}
              <div className="p-5 border border-dashed border-border/80 bg-muted/10 rounded-xl space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="croquis-files" className="font-semibold text-foreground/80">
                    Cargar fotos para reconstrucción
                  </Label>
                  <Input
                    id="croquis-files"
                    type="file"
                    accept="image/*"
                    multiple
                    className="cursor-pointer bg-card border-border/80 hover:border-indigo-500 transition-colors"
                    onChange={(e) => setCroquisFiles(e.target.files ? Array.from(e.target.files) : [])}
                  />
                  {croquisFiles.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{croquisFiles.length} archivo(s) seleccionados. listo para procesar.</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Selecciona una o más imágenes del lugar del accidente para generar el croquis 3D.
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={handleCroquis3D} 
                  disabled={!(croquisFiles.length > 0) || !croquisFotos || loading}
                  className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Generando Croquis 3D...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Generar croquis
                    </>
                  )}
                </Button>
              </div>

              {/* Resultado del Croquis Formateado */}
              {croquisResult && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="border-t border-border/60 my-2 pt-6"></div>
                  
                  {croquisData && (croquisData.croquis_3d_url || croquisData.vehiculos) ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* LADO IZQUIERDO: Dibujo Generado (Croquis) */}
                      <div className="lg:col-span-7 space-y-4">
                        <h3 className="font-semibold text-foreground/90 text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <Map className="h-4 w-4 text-indigo-500" /> Vista del Croquis Generado
                        </h3>
                        <Card className="overflow-hidden border border-border/80 shadow-md bg-muted/20 relative group">
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-indigo-600/95 text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
                              Modelo 3D Reconstruido
                            </span>
                          </div>
                          
                          <div className="aspect-video relative overflow-hidden flex items-center justify-center bg-slate-950">
                            {/* Scanning laser effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 h-1/2 w-full animate-pulse top-0 pointer-events-none"></div>
                            
                            <img 
                              src={croquisData.croquis_3d_url || "/images/mock-croquis-3d.png"} 
                              alt="Croquis 3D del accidente" 
                              className="object-contain w-full h-full max-h-[350px] transition-transform duration-300 group-hover:scale-[1.02]"
                              onError={(e) => {
                                // Fallback image if it fails to load
                                e.currentTarget.src = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60"
                              }}
                            />
                          </div>
                          
                          <div className="p-3 bg-muted/50 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
                            <span>Archivo: {(croquisData.croquis_3d_url || "/images/mock-croquis-3d.png").split('/').pop()}</span>
                            <div className="flex gap-2">
                              <a 
                                href={croquisData.croquis_3d_url || "/images/mock-croquis-3d.png"} 
                                download="croquis_3d.png"
                                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" /> Descargar
                              </a>
                            </div>
                          </div>
                        </Card>
                        
                        {croquisData.comentario && (
                          <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex gap-3 text-xs text-indigo-800 dark:text-indigo-300">
                            <Info className="h-5 w-5 text-indigo-500 shrink-0" />
                            <div>
                              <p className="font-semibold text-[13px] mb-0.5">Nota de Reconstrucción</p>
                              <p className="leading-relaxed">{croquisData.comentario}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* LADO DERECHO: Listado con datos necesarios */}
                      <div className="lg:col-span-5 space-y-6">
                        
                        {/* Vehículos */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground/90 text-sm uppercase tracking-wider flex items-center gap-1.5">
                            <Car className="h-4 w-4 text-indigo-500" /> Vehículos Involucrados
                          </h3>
                          <div className="space-y-3">
                            {croquisData.vehiculos && croquisData.vehiculos.map((v: any, index: number) => (
                              <Card key={v.id || index} className="border border-border/80 hover:border-border transition-all shadow-sm">
                                <CardContent className="p-3.5 flex items-start gap-3">
                                  <div className={`p-2.5 rounded-xl ${
                                    v.color?.toLowerCase() === 'rojo' 
                                      ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' 
                                      : 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                                  }`}>
                                    <Car className="h-5 w-5" />
                                  </div>
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="font-bold text-sm text-foreground">
                                        Vehículo {v.id || index + 1}
                                      </h4>
                                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground">
                                        {v.color || 'Desconocido'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1 text-xs">
                                      <p className="text-foreground/80 truncate">
                                        <span className="font-semibold text-muted-foreground">Marca/Modelo:</span> {v.marca || 'N/A'}
                                      </p>
                                      <p className="text-foreground/80">
                                        <span className="font-semibold text-muted-foreground">Posición:</span> {v.posicion || 'N/A'}
                                      </p>
                                      {v.daño && (
                                        <p className="text-rose-600 dark:text-rose-400 font-medium">
                                          <span className="font-semibold text-muted-foreground">Daño detectado:</span> {v.daño}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Medidas y Huellas */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground/90 text-sm uppercase tracking-wider flex items-center gap-1.5">
                            <Ruler className="h-4 w-4 text-indigo-500" /> Mediciones de Escena
                          </h3>
                          <Card className="border border-border/80 shadow-sm">
                            <CardContent className="p-4 space-y-3.5">
                              {/* Huellas de frenado */}
                              {croquisData.huellas_frenado && croquisData.huellas_frenado.length > 0 && (
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                                    <Gauge className="h-3.5 w-3.5 text-indigo-500" /> Huellas de Frenado
                                  </Label>
                                  <div className="bg-muted/30 rounded-lg p-2.5 space-y-1 border border-border/40 text-xs font-medium text-foreground/85">
                                    {croquisData.huellas_frenado.map((h: any, idx: number) => (
                                      <div key={idx} className="flex justify-between">
                                        <span>Vehículo {h.vehiculo}:</span>
                                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{h.longitud_metros} m</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Medidas de calle */}
                              {croquisData.medidas && (
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                                    <Ruler className="h-3.5 w-3.5 text-indigo-500" /> Dimensiones e Impacto
                                  </Label>
                                  <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5 border border-border/40 text-xs font-medium text-foreground/85">
                                    {Object.entries(croquisData.medidas).map(([key, val]: any) => (
                                      <div key={key} className="flex justify-between items-start gap-4">
                                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                        <span className="font-mono font-bold text-right shrink-0">{val}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                    </div>
                  ) : (
                    // Fallback visual si el JSON no tiene las propiedades correctas
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground mb-2 font-mono">Respuesta cruda del backend (JSON):</p>
                      <pre className="whitespace-pre-wrap text-xs font-mono text-foreground/90 bg-muted/40 p-3 rounded-lg overflow-x-auto">{croquisResult}</pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="velocidad" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" /> Velocidad por Huellas
              </CardTitle>
              <CardDescription>
                Calcula la velocidad aproximada a partir de una foto de huellas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="velocidad-file">Cargar foto de huellas</Label>
                <Input
                  id="velocidad-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setVelocidadFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>
              <Button onClick={handleVelocidad} disabled={!velocidadFile || loading}>
                <Send className="mr-2 h-4 w-4" /> Calcular velocidad
              </Button>
              {velocidadResult && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90">{velocidadResult}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dictamen" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" /> Dictamen Prellenado
              </CardTitle>
              <CardDescription>
                Extrae datos de licencia, tarjeta y placa para crear un dictamen inicial.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="file-licencia">Cargar licencia</Label>
                  <Input
                    id="file-licencia"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDictamenFiles((prev) => ({ ...prev, licencia: e.target.files?.[0] }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-tarjeta">Cargar tarjeta</Label>
                  <Input
                    id="file-tarjeta"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDictamenFiles((prev) => ({ ...prev, tarjeta: e.target.files?.[0] }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-placa">Cargar placa</Label>
                  <Input
                    id="file-placa"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDictamenFiles((prev) => ({ ...prev, placa: e.target.files?.[0] }))}
                  />
                </div>
              </div>
              <Button
                onClick={handleDictamenPrellenado}
                disabled={loading || !(dictamenFiles.licencia && dictamenFiles.tarjeta && dictamenFiles.placa)}
              >
                <Send className="mr-2 h-4 w-4" /> Generar dictamen
              </Button>
              {dictamenResult && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90">{JSON.stringify(dictamenResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" /> Análisis de Video
              </CardTitle>
              <CardDescription>
                Detecta el momento de impacto y los segmentos clave en grabaciones C5i.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-file">Cargar archivo de video</Label>
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>
              <Button onClick={handleAnalizarVideo} disabled={!videoFile || loading}>
                <Send className="mr-2 h-4 w-4" /> Analizar video
              </Button>
              {videoResult && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90">{JSON.stringify(videoResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inconsistencias" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Detección de Inconsistencias
              </CardTitle>
              <CardDescription>
                Compara versiones, daños y huellas para detectar contradicciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="conductores-json">Conductores (JSON)</Label>
                  <Textarea
                    id="conductores-json"
                    value={conductoresJson}
                    onChange={(e) => setConductoresJson(e.target.value)}
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehiculos-json">Vehículos (JSON)</Label>
                  <Textarea
                    id="vehiculos-json"
                    value={vehiculosJson}
                    onChange={(e) => setVehiculosJson(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
              <Button onClick={handleDetectarInconsistencias} disabled={loading}>
                <Send className="mr-2 h-4 w-4" /> Detectar inconsistencias
              </Button>
              {inconsistenciasResult && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90">{inconsistenciasResult}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="similares" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" /> Banco de Dictámenes
              </CardTitle>
              <CardDescription>
                Busca dictámenes similares y patrones de culpa en la base de datos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="similares-lugar">Lugar</Label>
                  <Input
                    id="similares-lugar"
                    value={similaresLugar}
                    onChange={(e) => setSimilaresLugar(e.target.value)}
                    placeholder="Mérida"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="similares-tipo">Tipo de accidente</Label>
                  <Input
                    id="similares-tipo"
                    value={similaresTipo}
                    onChange={(e) => setSimilaresTipo(e.target.value)}
                    placeholder="alcance"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleBuscarSimilares} disabled={!similaresLugar.trim() || !similaresTipo.trim() || loading}>
                  <Send className="mr-2 h-4 w-4" /> Buscar similares
                </Button>
                <Button onClick={handleBuscarConsulta} disabled={!consultaSearch.trim() || loading}>
                  <Send className="mr-2 h-4 w-4" /> Buscar por consulta
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="consulta-search">Consulta semántica</Label>
                  <Input
                    id="consulta-search"
                    value={consultaSearch}
                    onChange={(e) => setConsultaSearch(e.target.value)}
                    placeholder="Accidente por no ceder el paso"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant={recordingSearch ? 'destructive' : 'secondary'}
                    onClick={() => {
                      if (recordingSearch) {
                        stopSpeech()
                      } else {
                        startSpeech('search')
                      }
                    }}
                    disabled={!speechSupported || loading}
                  >
                    <Mic className="mr-2 h-4 w-4" /> {recordingSearch ? 'Detener' : 'Grabar'}
                  </Button>
                </div>
              </div>
              {!speechSupported && (
                <p className="text-sm text-muted-foreground">Tu navegador no soporta reconocimiento de voz.</p>
              )}

              {similaresResult.length > 0 && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <h3 className="text-lg font-semibold">Dictámenes similares</h3>
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90">{JSON.stringify(similaresResult, null, 2)}</pre>
                </div>
              )}
              {searchResult.length > 0 && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <h3 className="text-lg font-semibold">Resultados de búsqueda</h3>
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90">{JSON.stringify(searchResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
