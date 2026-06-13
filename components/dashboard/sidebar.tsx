"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  LineChart,
  Brain,
  Network,
  CheckSquare,
  FlaskConical,
  TrendingUp,
  FileText,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Proyecto", icon: FolderKanban, href: "/proyecto" },
  { label: "Diagnóstico (Encuesta)", icon: ClipboardList, href: "/diagnostico" },
  { label: "Analítica de Necesidades", icon: LineChart, href: "/analitica" },
  { label: "Predicción de Cursos", icon: Brain, href: "/prediccion" },
  { label: "Malla Formativa", icon: Network, href: "/malla-formativa" },
  { label: "Validación (Encuesta)", icon: CheckSquare, href: "/validacion" },
  { label: "Producción Científica", icon: FlaskConical, href: "/produccion" },
  { label: "Avance del Proyecto", icon: TrendingUp, href: "/avance" },
  { label: "Reportes", icon: FileText, href: "/reportes" },
  { label: "Configuración", icon: Settings, href: "/configuracion" },
]

function ProjectInfo() {
  return (
    <div className="mt-auto border-t border-sidebar-border px-4 py-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60">
        Información del Proyecto
      </p>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-sidebar-foreground/70">Inicio</dt>
          <dd className="font-medium text-sidebar-foreground">01/05/2025</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sidebar-foreground/70">Fin</dt>
          <dd className="font-medium text-sidebar-foreground">30/04/2026</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sidebar-foreground/70">Duración</dt>
          <dd className="font-medium text-sidebar-foreground">12 meses</dd>
        </div>
      </dl>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-sidebar-foreground/70">Tiempo transcurrido</span>
          <span className="font-semibold text-sidebar-foreground">7 / 12 meses</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-sidebar-border">
          <div
            className="h-full rounded-full bg-sidebar-primary"
            style={{ width: "58%" }}
          />
        </div>
        <p className="mt-1 text-right text-xs font-medium text-sidebar-primary-foreground/80">
          58% transcurrido
        </p>
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <Link href="/" className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sidebar-foreground/10 font-mono text-lg font-bold text-sidebar-foreground">
          UG
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">Universidad</p>
          <p className="text-xs text-sidebar-foreground/70">de Guayaquil</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <ProjectInfo />
    </aside>
  )
}
