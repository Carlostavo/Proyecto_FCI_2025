"use client"

import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProjectScheduleItem } from "@/lib/project-schedule"

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000))
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

export function ProjectGantt({ items }: { items: ProjectScheduleItem[] }) {
  const dates = items.flatMap((item) => [toDate(item.inicio), toDate(item.fin)])
  const projectStart = new Date(Math.min(...dates.map((date) => date.getTime())))
  const projectEnd = new Date(Math.max(...dates.map((date) => date.getTime())))
  const totalDays = daysBetween(projectStart, projectEnd)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base">Cronograma / Gantt del Proyecto</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Visualización por fases con fechas, responsables y estado.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>{projectStart.toLocaleDateString("es-EC")} - {projectEnd.toLocaleDateString("es-EC")}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[220px_1fr_120px] items-center gap-3 rounded-md bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Fase</span>
          <span>Cronograma</span>
          <span>Responsable</span>
        </div>
        <div className="space-y-3">
          {items.map((item) => {
            const start = toDate(item.inicio)
            const end = toDate(item.fin)
            const offset = ((start.getTime() - projectStart.getTime()) / (totalDays * 86_400_000)) * 100
            const width = (daysBetween(start, end) / totalDays) * 100

            return (
              <div key={item.fase} className="grid grid-cols-[220px_1fr_120px] items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <p className="font-medium text-foreground">{item.fase}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.inicio} - {item.fin} · {item.estado}
                  </p>
                </div>
                <div className="relative h-10 rounded-md bg-slate-100">
                  <div
                    className="absolute top-2 h-6 rounded-md shadow-sm"
                    style={{
                      left: `${offset}%`,
                      width: `${width}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">{item.responsable}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
