"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface SurveyQuestion {
  campo: string
  pregunta: string
  tipo: "texto" | "radio" | "checkbox" | "numero"
  opciones?: string[]
  requerido?: boolean
}

const SURVEY_STRUCTURE: SurveyQuestion[] = [
  {
    campo: "parroquia",
    pregunta: "1. ¿En qué parroquia se encuentra ubicado el emprendimiento?",
    tipo: "radio",
    opciones: [
      "Ximena",
      "Tarqui",
      "Pascuales",
      "La puntilla",
      "Chongón",
      "Vinces",
      "Febres cordero",
      "Samborondon",
      "Tarifa",
      "Otra",
    ],
    requerido: true,
  },
  {
    campo: "sector_ubicacion",
    pregunta:
      "2. ¿Cuál es el sector en donde se encuentra ubicado el emprendimiento? (Ciudadela/barrio/cooperativa)",
    tipo: "texto",
    requerido: true,
  },
  {
    campo: "antiguedad_emprendimiento",
    pregunta: "3. ¿Cuántos años tiene vigente el emprendimiento?",
    tipo: "radio",
    opciones: [
      "Menos de 1 año",
      "1–3 años",
      "4–6 años",
      "7 años o más",
    ],
    requerido: true,
  },
  {
    campo: "sector_economico",
    pregunta: "4. ¿Cuál es el principal sector económico del emprendimiento?",
    tipo: "radio",
    opciones: [
      "Comercio (venta de productos)",
      "Servicios",
      "Alimentación/gastronomía",
      "Textiles/confecciones",
      "Artesanías/manualidades",
      "Otro",
    ],
    requerido: true,
  },
  {
    campo: "ingreso_mensual",
    pregunta: "5. ¿Cuál es el ingreso mensual aproximado que genera el emprendimiento?",
    tipo: "radio",
    opciones: [
      "Menos de 200 USD",
      "200 – 399 USD",
      "400 – 699 USD",
      "700 – 999 USD",
      "1000 USD o más",
      "No desea responder",
    ],
    requerido: true,
  },
  {
    campo: "nivel_instruccion",
    pregunta: "6. ¿Cuál es su mayor nivel de instrucción formal alcanzado?",
    tipo: "radio",
    opciones: [
      "Sin instrucción",
      "Primaria",
      "Secundaria",
      "Técnica/tecnológica",
      "Universitaria",
    ],
    requerido: true,
  },
  {
    campo: "etnia",
    pregunta: "7. ¿Con qué etnia se auto identifica?",
    tipo: "radio",
    opciones: [
      "Indígena",
      "Mestiza",
      "Blanca",
      "Afroecuatoriana",
      "Montubia",
    ],
    requerido: true,
  },
  {
    campo: "situacion_formalizacion",
    pregunta:
      "8. Sobre los papeles de su negocio (permisos de funcionamiento, obtención de RUC, entre otros), ¿cuál es su situación actual?",
    tipo: "radio",
    opciones: [
      "Ya estoy formalizado/a al 100% y tengo todos mis documentos en regla.",
      "Estoy en proceso (tengo algunos documentos, pero me faltan o están en trámite).",
      "Aún no me formalizo, porque no sé por dónde empezar ni qué documentos necesito.",
      "Aún no me formalizo, porque los procesos me parecen demasiado complejos o largos",
      "Aún no me formalizo, principalmente por la falta de recursos económicos o costos de los trámites.",
    ],
    requerido: true,
  },
  {
    campo: "control_dinero",
    pregunta:
      "9. ¿Lleva algún control o registro del dinero que gana y gasta de su negocio?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "planifica_metas",
    pregunta:
      "10. ¿Suele planificar lo que quiere lograr en su negocio cada mes (por ejemplo, cuánto vender o qué productos ofrecer)?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "reinvierte_ganancias",
    pregunta:
      "11. ¿Guarda una parte de las ganancias para volver a invertir en su negocio?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "define_precios_costos",
    pregunta:
      "12. Al fijar el precio de venta de sus productos o servicios, ¿Usted toma en cuenta lo que le cuesta hacerlo o comprarlo y la ganancia que espera tener?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "promocion_negocio",
    pregunta:
      "13. ¿Qué hace normalmente para que más personas conozcan o compren en su negocio?",
    tipo: "radio",
    opciones: [
      "Busco activamente nuevas formas de promocionar mi negocio (ferias, redes, volantes, etc.)",
      "Solo espero que los clientes lleguen a mi local",
    ],
    requerido: true,
  },
  {
    campo: "medios_promocion",
    pregunta:
      "14. Si marcó la segunda opción, indique las opciones que utiliza con más frecuencia (puede marcar más de una)",
    tipo: "checkbox",
    opciones: [
      "Boca a boca (recomendaciones)",
      "Redes sociales (Facebook, WhatsApp, Instagram, etc.)",
      "Ferias o mercados",
      "Volantes o afiches",
      "Ofertas",
      "Otra",
    ],
  },
  {
    campo: "usa_sugerencias_clientes",
    pregunta:
      "15. ¿Utiliza las opiniones y sugerencias de sus clientes para hacer mejoras o cambios en sus productos y servicios?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "dispositivo_internet",
    pregunta:
      "16. ¿Cuenta con algún dispositivo con acceso a Internet para apoyar la gestión de su negocio?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "dispositivos_usados",
    pregunta:
      "17. Si respondió Sí o A veces: indique cuál utiliza con mayor frecuencia (puede escoger más de una)",
    tipo: "checkbox",
    opciones: [
      "Teléfono",
      "Computadora",
      "Tablet",
    ],
  },
  {
    campo: "usa_apps_digitales",
    pregunta:
      "18. ¿Acostumbra a utilizar aplicaciones digitales como WhatsApp, Facebook u otros para dar a conocer sus productos y conversar con sus clientes?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "apps_usadas",
    pregunta:
      "19. Si respondió Sí o A veces: indique cuál utiliza con mayor frecuencia (puede escoger más de una)",
    tipo: "checkbox",
    opciones: [
      "WhatsApp",
      "Facebook/Marketplace",
      "Instagram",
      "TikTok",
      "Otra",
    ],
  },
  {
    campo: "usa_pagos_digitales",
    pregunta:
      "20. ¿Acostumbra a usar pagos digitales, como transferencias bancarias o aplicaciones móviles, para cobrar o pagar en su negocio?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "pagos_usados",
    pregunta:
      "21. Si respondió Sí o A veces: indique cuál utiliza con mayor frecuencia (puede escoger más de una)",
    tipo: "checkbox",
    opciones: [
      "Transferencia bancaria",
      "Aplicación del banco móvil / banca en línea",
      "Deuna / botón QR",
      "PayPhone",
      "Otra",
    ],
  },
  {
    campo: "dificultad_tecnologia",
    pregunta:
      "22. ¿Cuál es la principal dificultad que ha tenido para usar la tecnología en la gestión de su negocio?",
    tipo: "radio",
    opciones: [
      "No tengo dificultad",
      "No tengo internet o es muy caro",
      "No sé usar bien las aplicaciones",
      "No tengo tiempo para aprender",
      "No tengo quién me enseñe",
      "Falta de tiempo",
      "Otra",
    ],
    requerido: true,
  },
  {
    campo: "incorpora_cultura",
    pregunta:
      "23. ¿Incorpora elementos de su cultura o tradiciones en la identidad de su negocio?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "elementos_culturales",
    pregunta:
      "24. Si respondió Sí o A veces: ¿Cuáles son estos elementos? (puede marcar más de una)",
    tipo: "checkbox",
    opciones: [
      "Saberes o recetas familiares",
      "Técnicas artesanales o manualidades tradicionales",
      "Materiales o recursos propios de su comunidad",
      "Símbolos, música o formas de vestir culturales",
      "Otra",
    ],
  },
  {
    campo: "origen_conocimiento_cultural",
    pregunta:
      "25. ¿De dónde es el origen de este conocimiento o producto cultural?",
    tipo: "radio",
    opciones: [
      "De mi familia (madre, abuela, tías, etc.)",
      "De personas de mi comunidad o grupo cultural",
      "Los aprendí por mi cuenta observando o practicando",
      "De otra fuente",
    ],
  },
  {
    campo: "participa_asociaciones",
    pregunta:
      "26. ¿Participa en grupos comunitarios, asociaciones u otros grupos de participación?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "asociaciones",
    pregunta:
      "27. Si respondió Sí o A veces: ¿En cuáles? (puede marcar más de una)",
    tipo: "checkbox",
    opciones: [
      "Asociación o grupo de artesanas",
      "Feria cultural o mercado tradicional",
      "Grupo en línea (WhatsApp, Facebook, etc.)",
      "Otra",
    ],
  },
  {
    campo: "interes_programa",
    pregunta:
      "28. ¿Desearías participar en nuestro programa de formación y capacitación?",
    tipo: "radio",
    opciones: [
      "Sí",
      "No",
      "A veces",
    ],
    requerido: true,
  },
  {
    campo: "contacto_programa",
    pregunta:
      "29. Si respondió Sí o A veces: ¿Cuál sería tu forma preferida para que nos comuniquemos contigo?",
    tipo: "radio",
    opciones: [
      "Teléfono",
      "Email",
      "WhatsApp",
      "Presencial",
    ],
  },
  {
    campo: "modalidad_preferida",
    pregunta:
      "30. ¿Cuál sería tu modalidad preferida de participación en el programa?",
    tipo: "radio",
    opciones: [
      "Virtual",
      "Presencial",
      "Híbrida (combinada virtual y presencial)",
    ],
  },
]

export function DynamicSurveyForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, string | string[]>>({})
  const [sesionId] = useState(() => {
    // Generar ID de sesión único y anónimo
    return `sesion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRespuesta = (campo: string, valor: string | string[]) => {
    setRespuestas((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const handleGuardarBorrador = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/survey/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesionId,
          respuestas,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Error guardando borrador")

      alert("Borrador guardado correctamente")
    } catch (err) {
      setError("Error guardando el borrador")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleEnviarEncuesta = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sesionId,
          respuestas,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Error enviando encuesta")

      setSubmitted(true)
    } catch (err) {
      setError("Error enviando la encuesta")
      console.error(err)
    } finally {
      setSaving(false)
    }
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

  const preguntaActual = SURVEY_STRUCTURE[currentStep]
  const totalPreguntas = SURVEY_STRUCTURE.length
  const progreso = ((currentStep + 1) / totalPreguntas) * 100

  const renderPregunta = () => {
    const valor = respuestas[preguntaActual.campo] || ""

    switch (preguntaActual.tipo) {
      case "texto":
        return (
          <Textarea
            placeholder="Escribe tu respuesta aquí..."
            value={typeof valor === "string" ? valor : ""}
            onChange={(e) => handleRespuesta(preguntaActual.campo, e.target.value)}
            rows={3}
          />
        )

      case "numero":
        return (
          <Input
            type="number"
            placeholder="Ingresa un número..."
            value={typeof valor === "string" ? valor : ""}
            onChange={(e) => handleRespuesta(preguntaActual.campo, e.target.value)}
          />
        )

      case "radio":
        return (
          <RadioGroup value={typeof valor === "string" ? valor : ""} onValueChange={(v) => handleRespuesta(preguntaActual.campo, v)}>
            <div className="space-y-2">
              {preguntaActual.opciones?.map((opcion) => (
                <div key={opcion} className="flex items-center space-x-2">
                  <RadioGroupItem value={opcion} id={opcion} />
                  <Label htmlFor={opcion}>{opcion}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )

      case "checkbox":
        const seleccionados = Array.isArray(valor) ? valor : []
        return (
          <div className="space-y-2">
            {preguntaActual.opciones?.map((opcion) => (
              <div key={opcion} className="flex items-center space-x-2">
                <Checkbox
                  id={opcion}
                  checked={seleccionados.includes(opcion)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleRespuesta(preguntaActual.campo, [
                        ...seleccionados,
                        opcion,
                      ])
                    } else {
                      handleRespuesta(
                        preguntaActual.campo,
                        seleccionados.filter((s) => s !== opcion)
                      )
                    }
                  }}
                />
                <Label htmlFor={opcion}>{opcion}</Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Pregunta {currentStep + 1} de {totalPreguntas}</span>
          <span>{Math.round(progreso)}%</span>
        </div>
        <Progress value={progreso} className="h-2" />
      </div>

      {/* Error */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Pregunta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{preguntaActual.pregunta}</CardTitle>
          {preguntaActual.tipo === "checkbox" && (
            <CardDescription>Puedes seleccionar múltiples opciones</CardDescription>
          )}
        </CardHeader>
        <CardContent>{renderPregunta()}</CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGuardarBorrador}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Borrador"
            )}
          </Button>

          {currentStep === totalPreguntas - 1 ? (
            <Button
              onClick={handleEnviarEncuesta}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enviar Encuesta
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Info sesión (para debugging) */}
      <div className="text-xs text-gray-400 text-center mt-8">
        Sesión: {sesionId.substring(0, 20)}...
      </div>
    </div>
  )
}
