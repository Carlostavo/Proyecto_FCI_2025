"use server"

import { createClient } from "@/lib/supabase/server"

export interface PreguntaDinamica {
  id: string
  id_bloque: string
  numero_pregunta: number
  pregunta: string
  tipo_respuesta: "texto" | "opcion_multiple" | "checkbox" | "escala"
  opciones?: Record<string, string[]>
  ayuda?: string
  requerida: boolean
  orden: number
  activo: boolean
  condicion_visible_json?: Record<string, unknown>
}

export interface BloqueDinamico {
  id: string
  nombre: string
  descripcion?: string
  orden: number
  activo: boolean
  preguntas: PreguntaDinamica[]
}

// Obtener todos los bloques con sus preguntas
export async function obtenerBloquesDinamicos(): Promise<BloqueDinamico[]> {
  const supabase = await createClient()

  const { data: bloques, error: errorBloques } = await supabase
    .from("encuesta_bloques")
    .select("*")
    .eq("activo", true)
    .order("orden")

  if (errorBloques) {
    console.error("Error obteniendo bloques:", errorBloques)
    return []
  }

  const bloquesConPreguntas = await Promise.all(
    (bloques || []).map(async (bloque) => {
      const { data: preguntas, error: errorPreguntas } = await supabase
        .from("encuesta_preguntas")
        .select("*")
        .eq("id_bloque", bloque.id)
        .eq("activo", true)
        .order("orden")

      if (errorPreguntas) {
        console.error(`Error obteniendo preguntas para bloque ${bloque.id}:`, errorPreguntas)
        return { ...bloque, preguntas: [] }
      }

      return {
        ...bloque,
        preguntas: (preguntas || []) as PreguntaDinamica[],
      }
    })
  )

  return bloquesConPreguntas as BloqueDinamico[]
}

// Obtener un bloque específico con sus preguntas
export async function obtenerBloqueDinamico(
  bloqueId: string
): Promise<BloqueDinamico | null> {
  const supabase = await createClient()

  const { data: bloque, error: errorBloque } = await supabase
    .from("encuesta_bloques")
    .select("*")
    .eq("id", bloqueId)
    .single()

  if (errorBloque) {
    console.error("Error obteniendo bloque:", errorBloque)
    return null
  }

  const { data: preguntas, error: errorPreguntas } = await supabase
    .from("encuesta_preguntas")
    .select("*")
    .eq("id_bloque", bloqueId)
    .order("orden")

  if (errorPreguntas) {
    console.error("Error obteniendo preguntas:", errorPreguntas)
    return null
  }

  return {
    ...bloque,
    preguntas: (preguntas || []) as PreguntaDinamica[],
  } as BloqueDinamico
}

// Crear una nueva pregunta
export async function crearPreguntaDinamica(
  datos: Omit<PreguntaDinamica, "id">
): Promise<{ ok: boolean; message: string; pregunta?: PreguntaDinamica }> {
  const supabase = await createClient()

  const { data: pregunta, error } = await supabase
    .from("encuesta_preguntas")
    .insert({
      id_bloque: datos.id_bloque,
      numero_pregunta: datos.numero_pregunta,
      pregunta: datos.pregunta,
      tipo_respuesta: datos.tipo_respuesta,
      opciones: datos.opciones,
      ayuda: datos.ayuda,
      requerida: datos.requerida,
      orden: datos.orden,
      condicion_visible_json: datos.condicion_visible_json,
    })
    .select()
    .single()

  if (error) {
    return {
      ok: false,
      message: `Error creando pregunta: ${error.message}`,
    }
  }

  return {
    ok: true,
    message: "Pregunta creada correctamente",
    pregunta: pregunta as PreguntaDinamica,
  }
}

// Actualizar una pregunta
export async function actualizarPreguntaDinamica(
  preguntaId: string,
  datos: Partial<PreguntaDinamica>
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("encuesta_preguntas")
    .update({
      pregunta: datos.pregunta,
      tipo_respuesta: datos.tipo_respuesta,
      opciones: datos.opciones,
      ayuda: datos.ayuda,
      requerida: datos.requerida,
      orden: datos.orden,
      activo: datos.activo,
      condicion_visible_json: datos.condicion_visible_json,
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq("id", preguntaId)

  if (error) {
    return {
      ok: false,
      message: `Error actualizando pregunta: ${error.message}`,
    }
  }

  return {
    ok: true,
    message: "Pregunta actualizada correctamente",
  }
}

// Ocultar/mostrar una pregunta
export async function toggleVisibilidadPregunta(
  preguntaId: string
): Promise<{ ok: boolean; message: string; activo?: boolean }> {
  const supabase = await createClient()

  const { data: pregunta, error: errorGet } = await supabase
    .from("encuesta_preguntas")
    .select("activo")
    .eq("id", preguntaId)
    .single()

  if (errorGet) {
    return {
      ok: false,
      message: `Error obteniendo pregunta: ${errorGet.message}`,
    }
  }

  const { error: errorUpdate } = await supabase
    .from("encuesta_preguntas")
    .update({
      activo: !pregunta.activo,
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq("id", preguntaId)

  if (errorUpdate) {
    return {
      ok: false,
      message: `Error actualizando visibilidad: ${errorUpdate.message}`,
    }
  }

  return {
    ok: true,
    message: `Pregunta ${!pregunta.activo ? "mostrada" : "ocultada"} correctamente`,
    activo: !pregunta.activo,
  }
}

// Eliminar una pregunta
export async function eliminarPreguntaDinamica(
  preguntaId: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("encuesta_preguntas")
    .delete()
    .eq("id", preguntaId)

  if (error) {
    return {
      ok: false,
      message: `Error eliminando pregunta: ${error.message}`,
    }
  }

  return {
    ok: true,
    message: "Pregunta eliminada correctamente",
  }
}

// Guardar respuesta de encuesta CSV
export async function guardarRespuestaCSV(
  idParticipante: string,
  idPregunta: string,
  respuesta: string | string[]
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient()

  const isArray = Array.isArray(respuesta)

  const { error } = await supabase
    .from("encuesta_respuestas_csv")
    .upsert(
      {
        id_participante: idParticipante,
        id_pregunta: idPregunta,
        respuesta: isArray ? null : (respuesta as string),
        respuesta_array: isArray ? (respuesta as string[]) : null,
        fecha_respuesta: new Date().toISOString(),
      },
      { onConflict: "id_participante,id_pregunta" }
    )

  if (error) {
    return {
      ok: false,
      message: `Error guardando respuesta: ${error.message}`,
    }
  }

  return {
    ok: true,
    message: "Respuesta guardada correctamente",
  }
}

// Obtener respuestas de un participante
export async function obtenerRespuestasParticipante(
  idParticipante: string
): Promise<Record<string, string | string[]>> {
  const supabase = await createClient()

  const { data: respuestas, error } = await supabase
    .from("encuesta_respuestas_csv")
    .select("id_pregunta, respuesta, respuesta_array")
    .eq("id_participante", idParticipante)

  if (error) {
    console.error("Error obteniendo respuestas:", error)
    return {}
  }

  const resultado: Record<string, string | string[]> = {}

  for (const row of respuestas || []) {
    if (row.respuesta_array) {
      resultado[row.id_pregunta] = row.respuesta_array
    } else if (row.respuesta) {
      resultado[row.id_pregunta] = row.respuesta
    }
  }

  return resultado
}

// Marcar encuesta como enviada
export async function marcarEncuestaEnviada(
  idParticipante: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("encuesta_participantes")
    .upsert({
      id_participante: idParticipante,
      estado: "enviada",
      fecha_envio: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    })

  if (error) {
    return {
      ok: false,
      message: `Error marcando encuesta como enviada: ${error.message}`,
    }
  }

  return {
    ok: true,
    message: "Encuesta marcada como enviada",
  }
}
