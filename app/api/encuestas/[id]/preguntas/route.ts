import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Supabase credentials are not configured")
  }

  return createClient(url, key)
}

// POST: Crear pregunta en un bloque
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { bloque_id, pregunta, tipo, opciones, texto_ayuda, requerido, visible_cuando } = body

    if (!bloque_id || !pregunta || !tipo) {
      return NextResponse.json(
        { error: "bloque_id, pregunta y tipo son requeridos" },
        { status: 400 }
      )
    }

    // Obtener el siguiente número de orden
    const { data: ultimaPregunta } = await supabase
      .from("encuesta_preguntas")
      .select("orden")
      .eq("bloque_id", bloque_id)
      .order("orden", { ascending: false })
      .limit(1)

    const orden = (ultimaPregunta?.[0]?.orden || 0) + 1

    const { data, error } = await supabase
      .from("encuesta_preguntas")
      .insert({
        bloque_id,
        pregunta,
        tipo,
        opciones: opciones || null,
        texto_ayuda: texto_ayuda || null,
        requerido: requerido !== undefined ? requerido : true,
        orden,
        visible_cuando: visible_cuando || null,
        estado: true,
        activo: true,
      })
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating pregunta:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
