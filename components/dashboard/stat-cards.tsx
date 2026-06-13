"use client"

import { TrendingUp, BookOpen, FileText, ClipboardCheck } from "lucide-react"
import { Card } from "@/components/ui/card"

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Avance del Proyecto */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Avance del Proyecto
          </h3>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-4xl font-bold text-primary">45%</p>
        <p className="text-sm text-muted-foreground">En progreso</p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: "45%" }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Fecha inicio
            <br />
            <span className="font-medium text-foreground">01/05/2025</span>
          </span>
          <span className="text-right">
            Fecha fin
            <br />
            <span className="font-medium text-foreground">30/04/2026</span>
          </span>
        </div>
      </Card>

      {/* Cursos Diseñados */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Cursos Diseñados
          </h3>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-4xl font-bold text-foreground">5</p>
        <p className="text-sm text-muted-foreground">2 en validación</p>
        <p className="mt-9 text-sm font-medium text-primary">8 módulos totales</p>
      </Card>

      {/* Producción Científica */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Producción Científica
          </h3>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-chart-3">
            <FileText className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-4xl font-bold text-foreground">
          3 <span className="text-2xl text-muted-foreground">/ 10</span>
        </p>
        <p className="text-sm text-muted-foreground">Productos completados</p>
        <p className="mt-9 text-sm font-medium text-chart-3">30% de cumplimiento</p>
      </Card>

      {/* Validación del Programa */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Validación del Programa (Encuesta)
          </h3>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-chart-4">
            <ClipboardCheck className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-4xl font-bold text-foreground">60</p>
        <p className="text-sm text-muted-foreground">Participantes encuestados</p>
        <p className="mt-9 text-sm font-medium text-chart-4">
          Meta: 60 participantes (75%)
        </p>
      </Card>
    </div>
  )
}
