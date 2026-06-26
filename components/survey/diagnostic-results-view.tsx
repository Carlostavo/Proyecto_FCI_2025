"use client"

import { useMemo, useState } from "react"
import { Cell, Label, Pie, PieChart } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DiagnosticResults } from "@/lib/diagnostic-results"

const palette = ["#DC2626", "#F97316", "#EAB308", "#22C55E", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899"]

function pct(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

export function DiagnosticResultsView({ results }: { results: DiagnosticResults }) {
  const [blockId, setBlockId] = useState(results.bloques[0]?.id ?? "")
  const [questionId, setQuestionId] = useState("")

  const selectedBlock = useMemo(
    () => results.bloques.find((block) => block.id === blockId) ?? results.bloques[0],
    [blockId, results.bloques],
  )

  const selectedQuestion = useMemo(() => {
    if (!selectedBlock) return undefined
    return selectedBlock.preguntas.find((question) => question.id === questionId) ?? selectedBlock.preguntas[0]
  }, [questionId, selectedBlock])

  if (!selectedBlock) {
    return <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">Todavía no hay resultados.</div>
  }

  const answeredQuestions = selectedBlock.preguntas.filter((question) => question.total > 0).length

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Diagnóstico (Encuesta)</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-950">Panel de análisis por bloque</h3>
            <p className="mt-2 text-sm text-slate-600">
              Vista ejecutiva de <code className="rounded bg-slate-100 px-1.5 py-0.5">cuestionario_limpio_respuestas</code>.
            </p>
          </div>

          <select
            value={blockId}
            onChange={(event) => {
              setBlockId(event.target.value)
              setQuestionId("")
            }}
            className="h-11 min-w-72 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-sky-500"
            aria-label="Seleccionar bloque"
          >
            {results.bloques.map((block) => (
              <option key={block.id} value={block.id}>
                {block.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-none">
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Encuestas analizadas</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{results.totalEncuestas}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bloque activo</p>
            <p className="mt-2 truncate text-lg font-semibold text-slate-950">{selectedBlock.title}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preguntas respondidas</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{answeredQuestions}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Respuestas registradas</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedBlock.totalRespuestas}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base">Distribución de respuestas</CardTitle>
            <Badge variant="secondary">{selectedQuestion?.total ?? 0} respuestas</Badge>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#2885D6" }} />
              Cantidad
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#78B8F1" }} />
              Porcentaje
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <select
              value={questionId}
              onChange={(event) => setQuestionId(event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-500"
            >
              <option value="">Selecciona una pregunta</option>
              {selectedBlock.preguntas.map((question) => (
                <option key={question.id} value={question.id}>
                  {question.label}
                </option>
              ))}
            </select>

            {selectedQuestion ? (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{selectedQuestion.label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedQuestion.total} respuestas</Badge>
                  <Badge variant="outline">{selectedQuestion.sinRespuesta} sin respuesta</Badge>
                  <Badge variant="secondary">{pct(selectedQuestion.total, results.totalEncuestas)}%</Badge>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            {selectedQuestion?.respuestas.length ? (
              <>
                <ChartContainer config={{ respuestas: { label: "Cantidad", color: "#2885D6" } }} className="h-[290px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={selectedQuestion.respuestas}
                      dataKey="total"
                      nameKey="respuesta"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={2}
                      strokeWidth={2}
                    >
                      {selectedQuestion.respuestas.map((answer, index) => (
                        <Cell key={answer.respuesta} fill={palette[index % palette.length]} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 8} className="fill-slate-900 text-2xl font-bold">
                                  {selectedQuestion.total}
                                </tspan>
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 14} className="fill-slate-500 text-xs">
                                  respuestas
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="grid gap-2 md:grid-cols-2">
                  {selectedQuestion.respuestas.map((answer, index) => (
                    <div key={answer.respuesta} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                      <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{answer.respuesta}</p>
                        <p className="text-xs text-slate-500">
                          Cantidad: {answer.total} · Porcentaje: {answer.porcentaje}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
                Elige una pregunta para revisar su distribución.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
