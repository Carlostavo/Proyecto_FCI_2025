"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  obtenerBloquesDinamicos,
  guardarRespuestaCSV,
  marcarEncuestaEnviada,
  type BloqueDinamico,
} from "@/lib/survey-dynamic-actions"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DynamicSurveyForm() {
  const [bloques, setBloques] = useState<BloqueDinamico[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentBlock, setCurrentBlock] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, string | string[]>>({})
  const [idParticipante, setIdParticipante] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBloques() {
      try {
        const data = await obtenerBloquesDinamicos()
        setBloques(data)
      } catch (err) {
        setError("Error cargando la encuesta")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadBloques()
  }, [])

  const handleRespuestaTexto = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }))
  }

  const handleRespuestaOpcion = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }))
  }

  const handleRespuestaCheckbox = (preguntaId: string, valor: string, checked: boolean) => {
    setRespuestas((prev) => {
      const current = (prev[preguntaId] as string[]) || []
      if (checked) {
        return { ...prev, [preguntaId]: [...current, valor] }
      } else {
        return {
          ...prev,
          [preguntaId]: current.filter((v) => v !== valor),
        }
      }
    })
  }

  const handleGuardarBorrador = async () => {
    if (!idParticipante.trim()) {
      setError("Por favor ingresa tu ID de participante")
      return
    }

    setSaving(true)
    setError(null)

    try {
      for (const [preguntaId, respuesta] of Object.entries(respuestas)) {
        if (respuesta) {
          await guardarRespuestaCSV(idParticipante, preguntaId, respuesta)
        }
      }
      alert("Borrador guardado correctamente")
    } catch (err) {
      setError("Error guardando el borrador")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleEnviarEncuesta = async () => {
    if (!idParticipante.trim()) {
      setError("Por favor ingresa tu ID de participante")
      return
    }

    setSaving(true)
    setError(null)

    try {
      for (const [preguntaId, respuesta] of Object.entries(respuestas)) {
        if (respuesta) {
          await guardarRespuestaCSV(idParticipante, preguntaId, respuesta)
        }
      }
      await marcarEncuestaEnviada(idParticipante)
      setSubmitted(true)
    } catch (err) {
      setError("Error enviando la encuesta")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Encuesta enviada correctamente! Tus respuestas han sido registradas.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const bloqueActual = bloques[currentBlock]
  const totalBloques = bloques.length
  const progreso = ((currentBlock + 1) / totalBloques) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Identificación */}
      {currentBlock === 0 && !idParticipante && (
        <Card>
          <CardHeader>
            <CardTitle>Identificación</CardTitle>
            <CardDescription>
              Por favor ingresa tu ID de participante para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="idParticipante">ID de Participante (del CSV)</Label>
              <Input
                id="idParticipante"
                value={idParticipante}
                onChange={(e) => setIdParticipante(e.target.value)}
                placeholder="Ej: PART_001"
              />
            </div>
            <Button
              onClick={() => idParticipante.trim() && setCurrentBlock(0)}
              disabled={!idParticipante.trim()}
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Errores */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progreso */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>
            Bloque {currentBlock + 1} de {totalBloques}
          </span>
          <span>{Math.round(progreso)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Bloque actual */}
      {bloqueActual && idParticipante && (
        <Card>
          <CardHeader>
            <CardTitle>{bloqueActual.nombre}</CardTitle>
            {bloqueActual.descripcion && (
              <CardDescription>{bloqueActual.descripcion}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {bloqueActual.preguntas.map((pregunta, idx) => (
              <div key={pregunta.id} className="space-y-2">
                <Label className="text-base font-semibold">
                  {idx + 1}. {pregunta.pregunta}
                  {pregunta.requerida && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {pregunta.ayuda && (
                  <p className="text-sm text-gray-600">{pregunta.ayuda}</p>
                )}

                {/* Texto */}
                {pregunta.tipo_respuesta === "texto" && (
                  <Textarea
                    value={(respuestas[pregunta.id] as string) || ""}
                    onChange={(e) =>
                      handleRespuestaTexto(pregunta.id, e.target.value)
                    }
                    placeholder="Tu respuesta aquí..."
                    rows={3}
                  />
                )}

                {/* Opción Múltiple */}
                {pregunta.tipo_respuesta === "opcion_multiple" &&
                  pregunta.opciones && (
                    <RadioGroup
                      value={(respuestas[pregunta.id] as string) || ""}
                      onValueChange={(valor) =>
                        handleRespuestaOpcion(pregunta.id, valor)
                      }
                    >
                      {pregunta.opciones.opciones?.map((opcion: string) => (
                        <div key={opcion} className="flex items-center space-x-2">
                          <RadioGroupItem value={opcion} id={`${pregunta.id}-${opcion}`} />
                          <Label htmlFor={`${pregunta.id}-${opcion}`} className="cursor-pointer">
                            {opcion}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                {/* Checkbox */}
                {pregunta.tipo_respuesta === "checkbox" &&
                  pregunta.opciones && (
                    <div className="space-y-2">
                      {pregunta.opciones.opciones?.map((opcion: string) => (
                        <div key={opcion} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${pregunta.id}-${opcion}`}
                            checked={((respuestas[pregunta.id] as string[]) || []).includes(
                              opcion
                            )}
                            onCheckedChange={(checked) =>
                              handleRespuestaCheckbox(
                                pregunta.id,
                                opcion,
                                !!checked
                              )
                            }
                          />
                          <Label
                            htmlFor={`${pregunta.id}-${opcion}`}
                            className="cursor-pointer"
                          >
                            {opcion}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Escala */}
                {pregunta.tipo_respuesta === "escala" && (
                  <RadioGroup
                    value={(respuestas[pregunta.id] as string) || ""}
                    onValueChange={(valor) =>
                      handleRespuestaOpcion(pregunta.id, valor)
                    }
                  >
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((valor) => (
                        <div key={valor} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={valor.toString()}
                            id={`${pregunta.id}-${valor}`}
                          />
                          <Label
                            htmlFor={`${pregunta.id}-${valor}`}
                            className="cursor-pointer"
                          >
                            {valor}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navegación */}
      {idParticipante && (
        <div className="flex gap-2 justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentBlock(Math.max(0, currentBlock - 1))}
            disabled={currentBlock === 0}
          >
            Anterior
          </Button>

          <Button
            variant="outline"
            onClick={handleGuardarBorrador}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Guardar Borrador
          </Button>

          {currentBlock === totalBloques - 1 ? (
            <Button onClick={handleEnviarEncuesta} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enviar Encuesta
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentBlock(Math.min(totalBloques - 1, currentBlock + 1))}
            >
              Siguiente
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
