"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileWarning,
  Users,
  Package,
  FileText,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OfficerData } from "./login-screen"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  officer?: OfficerData | null
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "incidents", label: "Siniestros", icon: FileWarning },
  { id: "assignments", label: "Peritos", icon: Users },
  { id: "evidence", label: "Evidencias", icon: Package },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "analytics", label: "Reportes", icon: BarChart3 },
  { id: "assistant", label: "Asistente IA", icon: Sparkles },
]

export function Sidebar({ activeView, setActiveView, isOpen, setIsOpen, mobileOpen, setMobileOpen, officer }: SidebarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }
  return (
    <>
      <aside
        className={cn(
          "hidden md:flex relative flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          isOpen ? "w-64" : "w-20"
        )}
      >
      {/* Logo & Title */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="relative h-12 w-12 flex-shrink-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-4R0fk928sMYw0UPmnjAVXTOhexU95A.png"
            alt="Secretaría de Seguridad Pública Yucatán"
            className="h-full w-full object-contain"
          />
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="font-bold text-lg text-sidebar-foreground tracking-tight">
              SIGET
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              Gestión de Evidencias
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {officer ? getInitials(officer.name) : "AS"}
            </div>
            <Circle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[150px]">
                Perito: {officer ? officer.name.split(" ").slice(0, 2).join(" ") : "Ángel Sánchez"}
              </span>
              <span className="text-xs text-sidebar-foreground/60 truncate max-w-[150px]">
                {officer ? (officer.shift.includes(" (") ? officer.shift.split(" (")[0] : officer.shift) : "Turno Matutino"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>
    </aside>

    <div
      className={cn(
        "fixed inset-0 z-50 flex md:hidden transition-all duration-200",
        mobileOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
      )}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setMobileOpen(false)}
      />
      <aside className="relative z-10 flex h-full w-72 max-w-[90vw] flex-col bg-sidebar border-r border-sidebar-border shadow-2xl">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-sidebar-border">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-sidebar-foreground tracking-tight">
              SIGET
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              Gestión de Evidencias
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileOpen(false)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id)
                  setMobileOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {officer ? getInitials(officer.name) : "AS"}
              </div>
              <Circle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[150px]">
                Perito: {officer ? officer.name.split(" ").slice(0, 2).join(" ") : "Ángel Sánchez"}
              </span>
              <span className="text-xs text-sidebar-foreground/60 truncate max-w-[150px]">
                {officer ? (officer.shift.includes(" (") ? officer.shift.split(" (")[0] : officer.shift) : "Turno Matutino"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </>
)
}
