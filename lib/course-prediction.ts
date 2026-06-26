import { createClient } from "@/lib/supabase/server"

export type CoursePrediction = {
  id: string
  bloque: string
  numeroBloque: number
  titulo: string
  descripcion: string
  brecha: number
  respuestas: number
}

type SurveyRow = Record<string, string | null>

function normalize(value: string | null | undefined) {
  return value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() ?? ""
}

function weak(value: string | null | undefined, terms: string[]) {
  const current = normalize(value)
  return terms.some((term) => current.includes(normalize(term)))
}

function gap(rows: SurveyRow[], checks: Array<(row: SurveyRow) => boolean>) {
  if (!rows.length || !checks.length) return 0
  const weakAnswers = rows.reduce(
    (total, row) => total + checks.reduce((sum, check) => sum + (check(row) ? 1 : 0), 0),
    0,
  )
  return Math.round((weakAnswers / (rows.length * checks.length)) * 100)
}

export async function getCoursePredictions(): Promise<CoursePrediction[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cuestionario_limpio_respuestas")
    .select("antiguedad_emprendimiento, ingreso_mensual, nivel_instruccion, situacion_formalizacion, control_dinero, planifica_metas, reinvierte_ganancias, define_precios_costos, promocion_negocio, usa_sugerencias_clientes, dispositivo_internet, usa_apps_digitales, usa_pagos_digitales, dificultad_tecnologia, incorpora_cultura, origen_conocimiento_cultural, participa_asociaciones, interes_programa, modalidad_preferida")
    .limit(5000)

  const rows = error ? [] : (data as SurveyRow[])
  const count = rows.length

  const baseGap = gap(rows, [
    (row) => weak(row.antiguedad_emprendimiento, ["menos de 1", "1-3"]),
    (row) => weak(row.ingreso_mensual, ["100-199", "200-399"]),
    (row) => weak(row.nivel_instruccion, ["primaria", "secundaria"]),
  ])

  const financeGap = gap(rows, [
    (row) => weak(row.situacion_formalizacion, ["no", "aun", "en proceso"]),
    (row) => weak(row.control_dinero, ["no", "a veces"]),
    (row) => weak(row.planifica_metas, ["no", "a veces", "parcial"]),
    (row) => weak(row.reinvierte_ganancias, ["no", "a veces"]),
    (row) => weak(row.define_precios_costos, ["no", "a veces", "intuicion"]),
  ])

  const digitalGap = gap(rows, [
    (row) => weak(row.promocion_negocio, ["solo espero", "no"]),
    (row) => weak(row.usa_sugerencias_clientes, ["no", "a veces"]),
    (row) => weak(row.dispositivo_internet, ["no", "a veces"]),
    (row) => weak(row.usa_apps_digitales, ["no", "a veces"]),
    (row) => weak(row.usa_pagos_digitales, ["no", "a veces", "solo efectivo"]),
    (row) => !weak(row.dificultad_tecnologia, ["ninguna", "no he tenido", "sin dificultad"]),
  ])

  const cultureGap = gap(rows, [
    (row) => weak(row.incorpora_cultura, ["no", "a veces", "parcial"]),
    (row) => weak(row.origen_conocimiento_cultural, ["no", "copia"]),
    (row) => weak(row.participa_asociaciones, ["no", "me gustaria"]),
  ])

  const participationGap = gap(rows, [
    (row) => weak(row.interes_programa, ["no", "restriccion", "a veces"]),
    (row) => !normalize(row.modalidad_preferida),
  ])

  const items: CoursePrediction[] = [
    {
      id: "base-modelo",
      bloque: "Información base del negocio",
      numeroBloque: 1,
      titulo: "Diseño de modelo de negocio para emprendedoras",
      descripcion: "Aterriza el negocio en clientas, propuesta de valor, productos, canales y fuentes de ingreso con ejercicios prácticos.",
      brecha: baseGap,
      respuestas: count,
    },
    {
      id: "base-crecimiento",
      bloque: "Información base del negocio",
      numeroBloque: 1,
      titulo: "Plan de crecimiento y metas del emprendimiento",
      descripcion: "Convierte la situación actual en metas claras de ventas, producción y sostenibilidad para el corto y mediano plazo.",
      brecha: baseGap,
      respuestas: count,
    },
    {
      id: "finanzas-control",
      bloque: "Gestión y finanzas",
      numeroBloque: 2,
      titulo: "Control de ingresos, gastos y flujo de caja",
      descripcion: "Refuerza el registro simple del dinero para saber cuánto entra, cuánto sale y cuánto realmente gana el negocio.",
      brecha: financeGap,
      respuestas: count,
    },
    {
      id: "finanzas-precios",
      bloque: "Gestión y finanzas",
      numeroBloque: 2,
      titulo: "Costos, precios y formalización básica",
      descripcion: "Aprende a calcular precios, reconocer costos, separar ganancia y ordenar pasos básicos de formalización.",
      brecha: financeGap,
      respuestas: count,
    },
    {
      id: "digital-basico",
      bloque: "Marketing y tecnología",
      numeroBloque: 3,
      titulo: "Uso de WhatsApp Business y catálogo digital",
      descripcion: "Organiza productos, mensajes frecuentes y atención a clientas para vender mejor desde el celular.",
      brecha: digitalGap,
      respuestas: count,
    },
    {
      id: "digital-redes",
      bloque: "Marketing y tecnología",
      numeroBloque: 3,
      titulo: "Promoción digital para microemprendimientos",
      descripcion: "Crea publicaciones, historias y contenido sencillo para redes sociales enfocado en visibilidad y ventas.",
      brecha: digitalGap,
      respuestas: count,
    },
    {
      id: "digital-herramientas",
      bloque: "Marketing y tecnología",
      numeroBloque: 3,
      titulo: "Herramientas digitales para organizar el negocio",
      descripcion: "Practica aplicaciones para pedidos, pagos, organización y seguridad digital sin complicaciones técnicas.",
      brecha: digitalGap,
      respuestas: count,
    },
    {
      id: "digital-pagos",
      bloque: "Marketing y tecnología",
      numeroBloque: 3,
      titulo: "Pagos digitales y cobros seguros",
      descripcion: "Refuerza el uso de transferencias, pagos QR y opciones seguras para cobrar y pagar con confianza.",
      brecha: digitalGap,
      respuestas: count,
    },
    {
      id: "cultura-marca",
      bloque: "Cultura e identidad",
      numeroBloque: 4,
      titulo: "Identidad cultural aplicada a productos y marca",
      descripcion: "Convierte elementos culturales en una propuesta auténtica que comunique valor sin perder identidad.",
      brecha: cultureGap,
      respuestas: count,
    },
    {
      id: "cultura-redes",
      bloque: "Cultura e identidad",
      numeroBloque: 4,
      titulo: "Redes comunitarias y comercialización colectiva",
      descripcion: "Fortalece alianzas, ferias y redes de apoyo para vender en conjunto y ampliar oportunidades.",
      brecha: cultureGap,
      respuestas: count,
    },
    {
      id: "participacion-ruta",
      bloque: "Participación en el programa",
      numeroBloque: 5,
      titulo: "Ruta flexible de aprendizaje emprendedor",
      descripcion: "Organiza la participación por horarios, modalidad y ritmo de avance para sostener la formación.",
      brecha: participationGap,
      respuestas: count,
    },
    {
      id: "participacion-liderazgo",
      bloque: "Participación en el programa",
      numeroBloque: 5,
      titulo: "Liderazgo y autonomía para continuar aprendiendo",
      descripcion: "Impulsa confianza, constancia y redes de apoyo para mantener el negocio y aprovechar la capacitación.",
      brecha: participationGap,
      respuestas: count,
    },
  ]

  return items.sort((a, b) => {
    if (b.brecha !== a.brecha) return b.brecha - a.brecha
    if (b.numeroBloque !== a.numeroBloque) return a.numeroBloque - b.numeroBloque
    return a.titulo.localeCompare(b.titulo)
  })
}
