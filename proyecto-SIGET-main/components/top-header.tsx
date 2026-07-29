"use client"

import { useState, useEffect } from "react"
import { Search, Bell, Menu, Calendar, Clock, ChevronDown, LogOut, User, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { OfficerData } from "./login-screen"

interface TopHeaderProps {
  sidebarOpen: boolean
  onMobileMenuToggle: () => void
  officer: OfficerData | null
  onShowProfile: (tab?: 'info' | 'stats' | 'activity' | 'settings') => void
  onLogout: () => void
}

const notifications = [
  {
    id: 1,
    title: "Nuevo siniestro reportado",
    description: "Periférico Km 24 - Colisión múltiple",
    time: "Hace 5 min",
    unread: true,
  },
  {
    id: 2,
    title: "Evidencia pendiente",
    description: "Folio ST-2024-0892 requiere fotografías",
    time: "Hace 15 min",
    unread: true,
  },
  {
    id: 3,
    title: "IPH completado",
    description: "Documento ST-2024-0890 firmado",
    time: "Hace 1 hora",
    unread: false,
  },
]

export function TopHeader({ sidebarOpen, onMobileMenuToggle, officer, onShowProfile, onLogout }: TopHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentDate = mounted
    ? new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  const currentTime = mounted
    ? new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b bg-card px-6 py-3">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Bar */}
        <div className="relative w-80 hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar folio, ubicación, perito..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date & Shift Display */}
        <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{currentDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificaciones
              <Badge variant="secondary">{unreadCount} nuevas</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              >
                <div className="flex items-center gap-2 w-full">
                  {notification.unread && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                  <span className="font-medium text-sm">
                    {notification.title}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground pl-4">
                  {notification.description}
                </span>
                <span className="text-xs text-muted-foreground/60 pl-4">
                  {notification.time}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              Ver todas las notificaciones
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        {officer && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-auto py-1.5">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={officer.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(officer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {officer.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                  <span className="text-xs text-muted-foreground">{officer.badge}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{officer.name}</p>
                  <p className="text-xs text-muted-foreground">{officer.rank}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onShowProfile()} className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShowProfile('settings')} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
