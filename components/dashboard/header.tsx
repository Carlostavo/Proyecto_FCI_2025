"use client"

import { Bell, CalendarDays, Download, ChevronDown, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export function Header({
  nombre = "Usuario",
  rol = "Miembro del proyecto",
}: {
  nombre?: string
  rol?: string
}) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-4">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-foreground">
          Proyecto FCI 2025
        </h1>
        <p className="truncate text-sm text-muted-foreground">
          Programa de formación y apoyo técnico para el emprendimiento de mujeres
          indígenas residentes en Guayaquil
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            1
          </span>
        </button>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials(nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-medium text-foreground">{nombre}</p>
            <p className="text-xs text-muted-foreground">{rol}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}

export function Toolbar() {
  return (
    <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Resumen general del proyecto
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>01/08/2025 - 30/10/2025</span>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          <Download className="h-4 w-4" />
          Exportar reporte
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
