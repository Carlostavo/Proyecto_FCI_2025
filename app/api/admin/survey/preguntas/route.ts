import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      id_bloque,
      numero_pregunta,
      pregunta,
      tipo_respuesta,
      opciones,
      ayuda,
      requerida,
    } = await request.json()

    if (!id_bloque || !pregunta || !tipo_respuesta) {
      return NextResponse.json(
        { error: "Campos requeridos faltantes" },
        { status: 400 }
      )
    }

    // Obtener el siguiente número de pregunta si no se proporciona
    let numPregunta = numero_pregunta
    if (!numPregunta) {
      const { data: lastQ } = await supabase
        .from("encuesta_preguntas")
        .select("numero_pregunta")
        .eq("id_bloque", id_bloque)
        .order("numero_pregunta", { ascending: false })
        .limit(1)
        .single()

      numPregunta = (lastQ?.numero_pregunta || 0) + 1
    }

    const { data, error } = await supabase
      .from("encuesta_preguntas")
      .insert({
        id_bloque,
        numero_pregunta: numPregunta,
        pregunta,
        tipo_respuesta,
        opciones: opciones || null,
        ayuda: ayuda || null,
        requerida: requerida !== false,
        activo: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[API] Error en POST /api/admin/survey/preguntas:", error)
    return NextResponse.json(
      { error: "Error creando pregunta" },
      { status: 500 }
    )
  }
}
