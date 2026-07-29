"use client"

import { useState } from "react"
import { Eye, EyeOff, Shield, Lock, User, AlertCircle, RefreshCw } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

interface LoginScreenProps {
  onLogin: (officer: OfficerData, token: string, rememberMe: boolean) => void
}

export interface OfficerData {
  id: string
  badge: string
  name: string
  rank: string
  unit: string
  email: string
  phone: string
  shift: string
  zone: string
  avatar?: string
  certifications: string[]
  activeIncidents: number
  completedIncidents: number
  joinDate: string
}

// URL base del backend desde variables de entorno de Next.js
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api-backend"

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [badge, setBadge] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Estado para el Token de Captcha (Cloudflare Turnstile)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!badge.trim() || !password) {
      setError("Por favor ingrese su número de placa y contraseña")
      return
    }

    if (!captchaToken) {
      setError("Por favor complete la verificación de seguridad (Captcha)")
      return
    }

    setIsLoading(true)

    try {
      // 🔒 Petición al Backend Seguro
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          badge: badge.trim(),
          password,
          captchaToken
        })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.error || "Credenciales inválidas. Intente nuevamente.")
        return
      }

      // 🔑 ÉXITO: Los datos del oficial (officer) provienen directamente del backend, no del cliente.
      onLogin(data.officer, data.token, rememberMe)

    } catch (err: any) {
      setError("Error al conectar con el servidor de autenticación. Intente más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-4R0fk928sMYw0UPmnjAVXTOhexU95A.png"
                alt="SSP Yucatán"
                className="h-24 w-24 object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">SIGET</h1>
          <p className="text-slate-400 text-sm">
            Sistema Integral de Gestión de Evidencias de Tránsito
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Secretaría de Seguridad Pública - Yucatán
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Acceso al Sistema
            </CardTitle>
            <CardDescription className="text-slate-400">
              Ingrese sus credenciales institucionales
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/30 border-red-800 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Placa / Badge */}
              <div className="space-y-2">
                <Label htmlFor="badge" className="text-slate-300">
                  Número de Placa
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="badge"
                    type="text"
                    placeholder="PT-0000"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500 hover:text-slate-300 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* CAPTCHA INTEGRADO */}
              <div className="flex justify-center py-2">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setError("Error al cargar la verificación de seguridad.")}
                  options={{
                    theme: "dark"
                  }}
                />
              </div>

              {/* Recordar Sesión / Recuperar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-slate-400 cursor-pointer"
                  >
                    Recordar sesión
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-amber-500 hover:text-amber-400 p-0 h-auto"
                >
                  Recuperar acceso
                </Button>
              </div>

              {/* Botón Iniciar Sesión */}
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium"
                disabled={isLoading || !captchaToken}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verificando credenciales...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                Sistema de uso exclusivo para personal autorizado de la
                Secretaría de Seguridad Pública del Estado de Yucatán.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600">
            v2.4.1 | Soporte Técnico: soporte@ssp.yucatan.gob.mx
          </p>
        </div>
      </div>
    </div>
  )
}