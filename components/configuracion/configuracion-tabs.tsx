"use client"

import { useState } from "react"
import {
  Users,
  ShieldCheck,
  Gauge,
  CalendarRange,
  Plus,
  Search,
  Check,
  X,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const SECCIONES = [
  { value: "usuarios", label: "Gestión de usuarios", icon: Users },
  { value: "roles", label: "Roles y permisos", icon: ShieldCheck },
  { value: "indicadores", label: "Parámetros de indicadores", icon: Gauge },
  { value: "periodos", label: "Periodos de evaluación", icon: CalendarRange },
] as const

export function ConfiguracionTabs({ usuarios = [] }: { usuarios?: Array<{ id: string; nombre_completo: string | null; email: string | null; rol: string; activa: boolean }> } = {}) {
  return (
    <Tabs defaultValue="usuarios" className="gap-6">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
        {SECCIONES.map((s) => (
          <TabsTrigger
            key={s.value}
            value={s.value}
            className="gap-2 rounded-md border border-border bg-card px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="usuarios">
        <GestionUsuarios usuarios={usuarios} />
      </TabsContent>
      <TabsContent value="roles">
        <RolesPermisos />
      </TabsContent>
      <TabsContent value="indicadores">
        <ParametrosIndicadores />
      </TabsContent>
      <TabsContent value="periodos">
        <PeriodosEvaluacion />
      </TabsContent>
    </Tabs>
  )
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </header>
      <div className="p-6">{children}</div>
    </section>
  )
}

const ROL_BADGE: Record<string, string> = {
  Administradora: "bg-primary/10 text-primary",
  Investigadora: "bg-chart-4/15 text-chart-4",
  Formadora: "bg-chart-3/15 text-chart-3",
  "Mujer emprendedora": "bg-secondary text-secondary-foreground",
  "Institución aliada": "bg-chart-2/15 text-chart-2",
  "Sin rol": "bg-secondary text-secondary-foreground",
}

function GestionUsuarios({ usuarios }: { usuarios: Array<{ id: string; nombre_completo: string | null; email: string | null; rol: string; activa: boolean }> }) {
  const [query, setQuery] = useState("")
  const filtrados = usuarios.filter(
    (u) =>
      (u.nombre_completo?.toLowerCase() ?? "").includes(query.toLowerCase()) ||
      (u.email?.toLowerCase() ?? "").includes(query.toLowerCase()),
  )

  return (
    <Panel
      title="Gestión de usuarios"
      description="Administra las personas con acceso a la plataforma"
      action={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo usuario
        </Button>
      }
    >
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o correo…"
          className="pl-9"
        />
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">{u.nombre_completo ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{u.email ?? "—"}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      ROL_BADGE[u.rol] ?? "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {u.rol}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={u.activa ? "default" : "secondary"}>
                    {u.activa ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar {u.nombre_completo}</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}

const PERMISOS = ["Ver dashboard", "Editar proyecto", "Gestionar usuarios", "Generar reportes", "Configurar indicadores"]
const MATRIZ: Record<string, boolean[]> = {
  Administradora: [true, true, true, true, true],
  Investigadora: [true, true, false, true, true],
  Formadora: [true, true, false, true, false],
  "Mujer emprendedora": [true, false, false, false, false],
  "Institución aliada": [true, false, false, true, false],
}

function RolesPermisos() {
  return (
    <Panel
      title="Roles y permisos"
      description="Define qué puede hacer cada rol dentro del sistema"
      action={
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo rol
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rol</TableHead>
              {PERMISOS.map((p) => (
                <TableHead key={p} className="text-center">
                  {p}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(MATRIZ).map(([rol, permisos]) => (
              <TableRow key={rol}>
                <TableCell className="font-medium text-foreground">{rol}</TableCell>
                {permisos.map((permitido, i) => (
                  <TableCell key={i} className="text-center">
                    {permitido ? (
                      <Check className="mx-auto h-4 w-4 text-primary" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}

const INDICADORES = [
  { nombre: "Asistencia a cursos", meta: 80, unidad: "%", activo: true },
  { nombre: "Productos científicos", meta: 12, unidad: "docs", activo: true },
  { nombre: "Satisfacción de participantes", meta: 90, unidad: "%", activo: true },
  { nombre: "Avance de malla formativa", meta: 100, unidad: "%", activo: false },
]

function ParametrosIndicadores() {
  return (
    <Panel
      title="Parámetros de indicadores"
      description="Configura las metas y umbrales de los indicadores del proyecto"
      action={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo indicador
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {INDICADORES.map((ind) => (
          <div key={ind.nombre} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-foreground">{ind.nombre}</p>
              <Switch defaultChecked={ind.activo} />
            </div>
            <div className="mt-4 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Meta objetivo ({ind.unidad})</Label>
              <Input type="number" defaultValue={ind.meta} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

const PERIODOS = [
  { nombre: "Diagnóstico inicial", inicio: "01/05/2025", fin: "30/06/2025", estado: "Finalizado" },
  { nombre: "Formación - Fase 1", inicio: "01/07/2025", fin: "30/10/2025", estado: "En curso" },
  { nombre: "Validación intermedia", inicio: "01/11/2025", fin: "15/12/2025", estado: "Programado" },
  { nombre: "Evaluación final", inicio: "01/03/2026", fin: "30/04/2026", estado: "Programado" },
]

const ESTADO_BADGE: Record<string, "default" | "secondary" | "outline"> = {
  Finalizado: "secondary",
  "En curso": "default",
  Programado: "outline",
}

function PeriodosEvaluacion() {
  return (
    <Panel
      title="Periodos de evaluación"
      description="Define las ventanas de tiempo para cada etapa de evaluación"
      action={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo periodo
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periodo</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERIODOS.map((p) => (
              <TableRow key={p.nombre}>
                <TableCell className="font-medium text-foreground">{p.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{p.inicio}</TableCell>
                <TableCell className="text-muted-foreground">{p.fin}</TableCell>
                <TableCell>
                  <Badge variant={ESTADO_BADGE[p.estado] ?? "outline"}>{p.estado}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar {p.nombre}</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}
