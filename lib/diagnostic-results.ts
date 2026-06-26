import { createClient } from "@/lib/supabase/server"

type QuestionConfig = {
  id: string
  label: string
  column: string
}

type BlockConfig = {
  id: string
  title: string
  description: string
  questions: QuestionConfig[]
}

export type DiagnosticAnswerCount = {
  respuesta: string
  total: number
  porcentaje: number
}

export type DiagnosticQuestionResult = QuestionConfig & {
  total: number
  sinRespuesta: number
  respuestas: DiagnosticAnswerCount[]
}

export type DiagnosticBlockResult = Omit<BlockConfig, "questions"> & {
  totalPreguntas: number
  totalRespuestas: number
  preguntas: DiagnosticQuestionResult[]
}

export type DiagnosticResults = {
  totalEncuestas: number
  bloques: DiagnosticBlockResult[]
}

const blocks: BlockConfig[] = [
  {
    id: "datos-base",
    title: "Bloque 1: Datos base del emprendimiento",
    description: "Ubicacion, trayectoria, actividad economica, ingresos, educacion e identidad cultural.",
    questions: [
      { id: "p1", label: "1. En que parroquia se encuentra ubicado el emprendimiento?", column: "parroquia" },
      { id: "p2", label: "2. Cual es el sector en donde se encuentra ubicado el emprendimiento? Ciudadela/barrio/cooperativa", column: "sector_ubicacion" },
      { id: "p3", label: "3. Cuantos anos tiene vigente el emprendimiento?", column: "antiguedad_emprendimiento" },
      { id: "p4", label: "4. Cual es el principal sector economico del emprendimiento?", column: "sector_economico" },
      { id: "p5", label: "5. Cual es el ingreso mensual aproximado que genera el emprendimiento?", column: "ingreso_mensual" },
      { id: "p6", label: "6. Cual es su mayor nivel de instruccion formal alcanzado?", column: "nivel_instruccion" },
      { id: "p7", label: "7. Con que etnia se autoidentifica?", column: "etnia" },
    ],
  },
  {
    id: "gestion-finanzas",
    title: "Bloque 2: Gestion y finanzas",
    description: "Formalizacion, control del dinero, planificacion, reinversion y definicion de precios.",
    questions: [
      { id: "p8", label: "8. Sobre los papeles de su negocio, cual es su situacion actual?", column: "situacion_formalizacion" },
      { id: "p9", label: "9. Lleva algun control o registro del dinero que gana y gasta de su negocio?", column: "control_dinero" },
      { id: "p10", label: "10. Suele planificar lo que quiere lograr en su negocio cada mes?", column: "planifica_metas" },
      { id: "p11", label: "11. Guarda una parte de las ganancias para volver a invertir en su negocio?", column: "reinvierte_ganancias" },
      { id: "p12", label: "12. Al fijar el precio de venta, toma en cuenta lo que le cuesta hacerlo o comprarlo y la ganancia esperada?", column: "define_precios_costos" },
    ],
  },
  {
    id: "comercial-digital",
    title: "Bloque 3: Marketing y tecnologia del negocio",
    description: "Promocion, clientes, acceso digital, aplicaciones, pagos y dificultades tecnologicas.",
    questions: [
      { id: "p13", label: "13. Que hace normalmente para que mas personas conozcan o compren en su negocio?", column: "promocion_negocio" },
      { id: "p14", label: "14. Utiliza las opiniones y sugerencias de sus clientes para hacer mejoras o cambios?", column: "usa_sugerencias_clientes" },
      { id: "p15", label: "15. Cuenta con algun dispositivo con acceso a internet para apoyar la gestion de su negocio?", column: "dispositivo_internet" },
      { id: "p16", label: "16. Acostumbra a utilizar aplicaciones digitales como WhatsApp, Facebook u otros para dar a conocer sus productos y conversar con sus clientes?", column: "usa_apps_digitales" },
      { id: "p17", label: "17. Acostumbra a usar pagos digitales, como transferencias bancarias o aplicaciones moviles, para cobrar o pagar en su negocio?", column: "usa_pagos_digitales" },
      { id: "p18", label: "18. Cual es la principal dificultad que ha tenido para usar la tecnologia en la gestion de su negocio?", column: "dificultad_tecnologia" },
    ],
  },
  {
    id: "cultura-redes",
    title: "Bloque 4: Cultura e identidad del negocio",
    description: "Identidad cultural, origen del conocimiento y participacion en asociaciones.",
    questions: [
      { id: "p19", label: "19. Incorpora elementos de su cultura o tradiciones en su negocio?", column: "incorpora_cultura" },
      { id: "p20", label: "20. De donde provienen esos conocimientos o practicas culturales que aplica en su negocio?", column: "origen_conocimiento_cultural" },
      { id: "p21", label: "21. Participa en grupos o asociaciones donde comparta su cultura o de a conocer sus productos tradicionales?", column: "participa_asociaciones" },
    ],
  },
  {
    id: "programa",
    title: "Bloque 5: General",
    description: "Interes de participacion y modalidad preferida para la formacion.",
    questions: [
      { id: "p22", label: "22. Le gustaria participar en el programa de capacitacion y formacion para emprendedoras?", column: "interes_programa" },
      { id: "p23", label: "23. En que modalidad preferiria recibir las capacitaciones?", column: "modalidad_preferida" },
    ],
  },
]

function normalizeAnswer(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ")
  if (typeof value !== "string") return ""
  return value.trim()
}

function countQuestion(rows: Record<string, unknown>[], question: QuestionConfig): DiagnosticQuestionResult {
  const counts = new Map<string, number>()
  let answered = 0

  for (const row of rows) {
    const raw = normalizeAnswer(row[question.column])
    if (!raw) continue
    answered += 1
    counts.set(raw, (counts.get(raw) ?? 0) + 1)
  }

  return {
    ...question,
    total: answered,
    sinRespuesta: rows.length - answered,
    respuestas: [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([respuesta, total]) => ({
        respuesta,
        total,
        porcentaje: answered ? Math.round((total / answered) * 100) : 0,
      })),
  }
}

export async function getDiagnosticResults(): Promise<DiagnosticResults> {
  const supabase = await createClient()
  const columns = [...new Set(blocks.flatMap((block) => block.questions.map((question) => question.column)))]
  const { data, count, error } = await supabase
    .from("cuestionario_limpio_respuestas")
    .select(columns.join(", "), { count: "exact" })
    .limit(5000)

  const rows = error || !data ? [] : (data as unknown as Record<string, unknown>[])

  return {
    totalEncuestas: count ?? rows.length,
    bloques: blocks.map((block) => {
      const preguntas = block.questions.map((question) => countQuestion(rows, question))
      return {
        id: block.id,
        title: block.title,
        description: block.description,
        totalPreguntas: block.questions.length,
        totalRespuestas: preguntas.reduce((total, question) => total + question.total, 0),
        preguntas,
      }
    }),
  }
}
