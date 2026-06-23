"use client"

import { useState, useEffect } from "react"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Edit2, Eye, EyeOff, Plus, AlertCircle } from "lucide-react"

interface Pregunta {
  id: string
  numero_pregunta: number
  pregunta: string
  tipo_respuesta: "texto" | "opcion_multiple" | "checkbox" | "escala" | "numerica"
  opciones?: { opciones: string[] }
  ayuda?: string
  requerida: boolean
  activo: boolean
  condicion_visible_json?: Record<string, unknown>
}

interface Bloque {
  id: string
  nombre: string
  descripcion?: string
  orden: number
  activo: boolean
  preguntas?: Pregunta[]
}

export function SurveyManagerAdmin() {
  const [bloques, setBloques] = useState<Bloque[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedBloque, setSelectedBloque] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Pregunta | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBloqueDialogOpen, setIsBloqueDialogOpen] = useState(false)
  const [newBloqueData, setNewBloqueData] = useState({ nombre: "", descripcion: "" })

  // Cargar bloques al montar
  useEffect(() => {
    loadBloques()
  }, []))

  const loadBloques = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/survey/bloques")
      if (!response.ok) throw new Error("Error cargando bloques")
      const data = await response.json()
      setBloques(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleAddBloque = async () => {
    if (!newBloqueData.nombre.trim()) {
      setError("El nombre del bloque es requerido")
      return
    }

    try {
      const response = await fetch("/api/admin/survey/bloques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBloqueData,
          orden: bloques.length + 1,
        }),
      })

      if (!response.ok) throw new Error("Error creando bloque")
      
      setSuccess("Bloque creado correctamente")
      setNewBloqueData({ nombre: "", descripcion: "" })
      setIsBloqueDialogOpen(false)
      await loadBloques()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const handleAddQuestion = (bloqueId: string) => {
    setSelectedBloque(bloqueId)
    setEditingQuestion(null)
    setIsDialogOpen(true)
  }

  const handleEditQuestion = (pregunta: Pregunta) => {
    setEditingQuestion(pregunta)
    setIsDialogOpen(true)
  }

  const handleToggleVisibility = async (bloqueId: string, preguntaId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/survey/preguntas/${preguntaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !currentActive }),
      })

      if (!response.ok) throw new Error("Error actualizando pregunta")
      setSuccess("Pregunta actualizada")
      await loadBloques()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const handleDeleteQuestion = async (preguntaId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta pregunta?")) return

    try {
      const response = await fetch(`/api/admin/survey/preguntas/${preguntaId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error eliminando pregunta")
      setSuccess("Pregunta eliminada")
      await loadBloques()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const handleDeleteBloque = async (bloqueId: string) => {
    if (!confirm("¿Estás seguro? Se eliminarán todas las preguntas del bloque")) return

    try {
      const response = await fetch(`/api/admin/survey/bloques/${bloqueId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error eliminando bloque")
      setSuccess("Bloque eliminado")
      await loadBloques()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  const handleSaveQuestion = async (pregunta: Pregunta) => {
    if (!selectedBloque) return

    try {
      if (editingQuestion) {
        // Actualizar
        const response = await fetch(`/api/admin/survey/preguntas/${editingQuestion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...pregunta,
            id_bloque: selectedBloque,
          }),
        })
        if (!response.ok) throw new Error("Error actualizando pregunta")
        setSuccess("Pregunta actualizada")
      } else {
        // Crear
        const response = await fetch("/api/admin/survey/preguntas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...pregunta,
            id_bloque: selectedBloque,
          }),
        })
        if (!response.ok) throw new Error("Error creando pregunta")
        setSuccess("Pregunta creada")
      }
      setIsDialogOpen(false)
      await loadBloques()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p>Cargando encuestas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestor de Encuestas Dinámicas</h2>
          <p className="text-gray-600 mt-1">
            Crea y gestiona bloques de preguntas con condiciones de visibilidad
          </p>
        </div>
        <Dialog open={isBloqueDialogOpen} onOpenChange={setIsBloqueDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Bloque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Bloque</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre del Bloque *</label>
                <Input
                  value={newBloqueData.nombre}
                  onChange={(e) =>
                    setNewBloqueData((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                  placeholder="Ej: Información Base"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={newBloqueData.descripcion}
                  onChange={(e) =>
                    setNewBloqueData((prev) => ({ ...prev, descripcion: e.target.value }))
                  }
                  placeholder="Descripción del bloque"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBloqueDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddBloque}>Crear Bloque</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bloques */}
      <div className="space-y-4">
        {bloques.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No hay bloques creados. Crea uno para comenzar.
            </CardContent>
          </Card>
        ) : (
          bloques.map((bloque) => (
            <Card key={bloque.id} className={!bloque.activo ? "opacity-50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {bloque.nombre}
                      {!bloque.activo && <Badge variant="destructive">Oculto</Badge>}
                    </CardTitle>
                    {bloque.descripcion && (
                      <CardDescription>{bloque.descripcion}</CardDescription>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Orden: {bloque.orden} | {bloque.preguntas?.length || 0} preguntas
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen && selectedBloque === bloque.id} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => handleAddQuestion(bloque.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Pregunta
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <QuestionEditForm
                          question={editingQuestion}
                          onSave={handleSaveQuestion}
                          onCancel={() => setIsDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBloque(bloque.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {bloque.preguntas && bloque.preguntas.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {bloque.preguntas.map((pregunta) => (
                      <div
                        key={pregunta.id}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium line-clamp-2">
                            {pregunta.numero_pregunta}. {pregunta.pregunta}
                          </div>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline">{pregunta.tipo_respuesta}</Badge>
                            {pregunta.requerida && (
                              <Badge variant="secondary">Requerida</Badge>
                            )}
                            {!pregunta.activo && (
                              <Badge variant="destructive">Oculta</Badge>
                            )}
                            {pregunta.condicion_visible_json && (
                              <Badge variant="outline">Condicional</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleToggleVisibility(bloque.id, pregunta.id, pregunta.activo)
                            }
                            title={pregunta.activo ? "Ocultar" : "Mostrar"}
                          >
                            {pregunta.activo ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              handleEditQuestion(pregunta)
                              setSelectedBloque(bloque.id)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteQuestion(pregunta.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

interface QuestionEditFormProps {
  question: Pregunta | null
  onSave: (question: Pregunta) => void
  onCancel: () => void
}

function QuestionEditForm({ question, onSave, onCancel }: QuestionEditFormProps) {
  const [pregunta, setPregunta] = useState(question?.pregunta || "")
  const [tipo, setTipo] = useState<Pregunta["tipo_respuesta"]>(question?.tipo_respuesta || "texto")
  const [opciones, setOpciones] = useState(
    question?.opciones ? question.opciones.opciones.join("\n") : ""
  )
  const [ayuda, setAyuda] = useState(question?.ayuda || "")
  const [requerida, setRequerida] = useState(question?.requerida ?? true)

  const handleSubmit = () => {
    if (!pregunta.trim()) {
      alert("El texto de la pregunta es requerido")
      return
    }

    const newQuestion: Pregunta = {
      id: question?.id || Math.random().toString(36),
      numero_pregunta: question?.numero_pregunta || 1,
      pregunta,
      tipo_respuesta: tipo,
      opciones:
        tipo !== "texto" && opciones.trim()
          ? { opciones: opciones.split("\n").filter((o) => o.trim()) }
          : undefined,
      ayuda: ayuda || undefined,
      requerida,
      activo: question?.activo ?? true,
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

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        <div>
          <label className="text-sm font-medium">Pregunta *</label>
          <Textarea
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="¿Cuál es tu pregunta?"
            rows={2}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tipo de Respuesta *</label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as Pregunta["tipo_respuesta"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="texto">Texto Libre</SelectItem>
              <SelectItem value="numerica">Numérica</SelectItem>
              <SelectItem value="opcion_multiple">Opción Múltiple</SelectItem>
              <SelectItem value="checkbox">Múltiples Selecciones</SelectItem>
              <SelectItem value="escala">Escala (1-5)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {tipo !== "texto" && tipo !== "numerica" && (
          <div>
            <label className="text-sm font-medium">Opciones (una por línea) *</label>
            <Textarea
              value={opciones}
              onChange={(e) => setOpciones(e.target.value)}
              placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
              rows={3}
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Texto de Ayuda</label>
          <Input
            value={ayuda}
            onChange={(e) => setAyuda(e.target.value)}
            placeholder="Texto adicional para ayudar al usuario"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requerida"
            checked={requerida}
            onChange={(e) => setRequerida(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="requerida" className="text-sm font-medium cursor-pointer">
            Pregunta Requerida
          </label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          {question ? "Actualizar" : "Crear"}
        </Button>
      </DialogFooter>
    </div>
  )
}
