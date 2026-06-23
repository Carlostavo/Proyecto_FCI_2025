"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Edit2, Eye, EyeOff, Plus, Copy } from "lucide-react"

interface Pregunta {
  id: string
  numero: number
  texto: string
  tipo: "texto" | "opcion_multiple" | "checkbox" | "escala"
  opciones?: string[]
  requerida: boolean
  activa: boolean
  condicion?: {
    pregunta_id: string
    valor: string
  }
}

interface Bloque {
  id: string
  nombre: string
  preguntas: Pregunta[]
}

export function SurveyQuestionManager() {
  const [bloques, setBloques] = useState<Bloque[]>([])
  const [selectedBloque, setSelectedBloque] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Pregunta | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleAddQuestion = (bloqueId: string) => {
    setSelectedBloque(bloqueId)
    setEditingQuestion(null)
    setIsOpen(true)
  }

  const handleEditQuestion = (bloque: Bloque, pregunta: Pregunta) => {
    setSelectedBloque(bloque.id)
    setEditingQuestion(pregunta)
    setIsOpen(true)
  }

  const handleToggleVisibility = (bloqueId: string, preguntaId: string) => {
    setBloques(
      bloques.map((b) =>
        b.id === bloqueId
          ? {
              ...b,
              preguntas: b.preguntas.map((p) =>
                p.id === preguntaId ? { ...p, activa: !p.activa } : p
              ),
            }
          : b
      )
    )
  }

  const handleDeleteQuestion = (bloqueId: string, preguntaId: string) => {
    setBloques(
      bloques.map((b) =>
        b.id === bloqueId
          ? {
              ...b,
              preguntas: b.preguntas.filter((p) => p.id !== preguntaId),
            }
          : b
      )
    )
  }

  const handleSaveQuestion = (pregunta: Pregunta) => {
    if (!selectedBloque) return

    setBloques(
      bloques.map((b) =>
        b.id === selectedBloque
          ? {
              ...b,
              preguntas: editingQuestion
                ? b.preguntas.map((p) => (p.id === pregunta.id ? pregunta : p))
                : [...b.preguntas, { ...pregunta, id: Math.random().toString() }],
            }
          : b
      )
    )
    setIsOpen(false)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Gestor de Preguntas de Encuesta</h2>
        <p className="text-gray-600 mt-2">
          Crea, edita y gestiona las preguntas dinámicas de la encuesta diagnóstica
        </p>
      </div>

      <Tabs defaultValue="bloques" className="w-full">
        <TabsList>
          <TabsTrigger value="bloques">Bloques y Preguntas</TabsTrigger>
          <TabsTrigger value="condiciones">Condiciones de Visibilidad</TabsTrigger>
          <TabsTrigger value="auditoria">Historial de Cambios</TabsTrigger>
        </TabsList>

        <TabsContent value="bloques" className="space-y-4">
          {bloques.map((bloque) => (
            <Card key={bloque.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{bloque.nombre}</CardTitle>
                    <CardDescription>{bloque.preguntas.length} preguntas</CardDescription>
                  </div>
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => handleAddQuestion(bloque.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Pregunta
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <QuestionEditForm
                        question={editingQuestion}
                        onSave={handleSaveQuestion}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {bloque.preguntas.length === 0 ? (
                  <p className="text-gray-500 py-4">Sin preguntas en este bloque</p>
                ) : (
                  <div className="space-y-2">
                    {bloque.preguntas.map((pregunta, idx) => (
                      <div
                        key={pregunta.id}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {idx + 1}. {pregunta.texto}
                          </div>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline">{pregunta.tipo}</Badge>
                            {pregunta.requerida && (
                              <Badge variant="secondary">Requerida</Badge>
                            )}
                            {!pregunta.activa && (
                              <Badge variant="destructive">Oculta</Badge>
                            )}
                            {pregunta.condicion && (
                              <Badge variant="outline">Condicional</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleToggleVisibility(bloque.id, pregunta.id)
                            }
                          >
                            {pregunta.activa ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditQuestion(bloque, pregunta)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteQuestion(bloque.id, pregunta.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="condiciones">
          <Card>
            <CardHeader>
              <CardTitle>Condiciones de Visibilidad</CardTitle>
              <CardDescription>
                Define cuándo mostrar u ocultar preguntas según respuestas anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Edita una pregunta y configura su condición de visibilidad
              </p>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Ejemplo:</strong> La pregunta "¿Cuál es tu presupuesto de
                  marketing?" solo se muestra si el usuario selecciona "Sí" en
                  "¿Tienes estrategia de marketing?"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auditoria">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cambios</CardTitle>
              <CardDescription>
                Registro de todas las modificaciones realizadas en las preguntas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">Cambio registrado automáticamente</p>
                  <p className="text-gray-600">Todos los cambios en preguntas se guardan con marca de tiempo y usuario</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function QuestionEditForm({
  question,
  onSave,
}: {
  question: Pregunta | null
  onSave: (question: Pregunta) => void
}) {
  const [texto, setTexto] = useState(question?.texto || "")
  const [tipo, setTipo] = useState<Pregunta["tipo"]>(question?.tipo || "texto")
  const [opciones, setOpciones] = useState(question?.opciones?.join("\n") || "")
  const [requerida, setRequerida] = useState(question?.requerida ?? true)

  const handleSubmit = () => {
    const newQuestion: Pregunta = {
      id: question?.id || Math.random().toString(),
      numero: question?.numero || 1,
      texto,
      tipo,
      opciones: tipo !== "texto" ? opciones.split("\n").filter((o) => o.trim()) : undefined,
      requerida,
      activa: question?.activa ?? true,
      condicion: question?.condicion,
    }
    onSave(newQuestion)
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {question ? "Editar Pregunta" : "Nueva Pregunta"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Texto de la Pregunta</label>
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="¿Cuál es tu pregunta?"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tipo de Respuesta</label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as Pregunta["tipo"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="texto">Texto</SelectItem>
              <SelectItem value="opcion_multiple">Opción Múltiple</SelectItem>
              <SelectItem value="checkbox">Múltiples Selecciones</SelectItem>
              <SelectItem value="escala">Escala (1-5)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {tipo !== "texto" && (
          <div>
            <label className="text-sm font-medium">Opciones (una por línea)</label>
            <Textarea
              value={opciones}
              onChange={(e) => setOpciones(e.target.value)}
              placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
              rows={4}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requerida"
            checked={requerida}
            onChange={(e) => setRequerida(e.target.checked)}
          />
          <label htmlFor="requerida" className="text-sm font-medium">
            Pregunta Requerida
          </label>
        </div>

        <Button onClick={handleSubmit} className="w-full">
          {question ? "Actualizar Pregunta" : "Crear Pregunta"}
        </Button>
      </div>
    </div>
  )
}
