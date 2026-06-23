import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Obtener bloques con sus preguntas
    const { data: bloques, error: bloqueError } = await supabase
      .from("encuesta_bloques")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true })

    if (bloqueError) throw bloqueError

    // Obtener preguntas para cada bloque
    const { data: preguntas, error: preguntasError } = await supabase
      .from("encuesta_preguntas")
      .select("*")
      .eq("activo", true)
      .order("numero_pregunta", { ascending: true })

    if (preguntasError) throw preguntasError

    // Combinar bloques con preguntas
    const bloquesConPreguntas = bloques.map((bloque) => ({
      ...bloque,
      preguntas: preguntas.filter((p) => p.id_bloque === bloque.id),
    }))

    return NextResponse.json(bloquesConPreguntas)
  } catch (error) {
    console.error("[API] Error en GET /api/admin/survey/bloques:", error)
    return NextResponse.json(
      { error: "Error obteniendo bloques" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { nombre, descripcion, orden } = await request.json()

    if (!nombre?.trim()) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("encuesta_bloques")
      .insert({
        nombre,
        descripcion,
        orden: orden || 1,
        activo: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[API] Error en POST /api/admin/survey/bloques:", error)
    return NextResponse.json(
      { error: "Error creando bloque" },
      { status: 500 }
    )
  }
}
