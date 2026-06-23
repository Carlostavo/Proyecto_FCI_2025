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

// PUT: Actualizar pregunta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ preguntaId: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { preguntaId } = await params
    const body = await request.json()
    const { pregunta, tipo, opciones, texto_ayuda, requerido, visible_cuando, estado } = body

    const { data, error } = await supabase
      .from("encuesta_preguntas")
      .update({
        pregunta: pregunta || undefined,
        tipo: tipo || undefined,
        opciones: opciones || undefined,
        texto_ayuda: texto_ayuda || undefined,
        requerido: requerido !== undefined ? requerido : undefined,
        visible_cuando: visible_cuando || undefined,
        estado: estado !== undefined ? estado : undefined,
      })
      .eq("id", preguntaId)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("[v0] Error updating pregunta:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PATCH: Ocultar/Mostrar pregunta
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ preguntaId: string }> }
) {
  try {
    const { preguntaId } = await params
    const body = await request.json()
    const { estado } = body

    if (estado === undefined) {
      return NextResponse.json(
        { error: "El campo 'estado' es requerido" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("encuesta_preguntas")
      .update({ estado })
      .eq("id", preguntaId)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("[v0] Error patching pregunta:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar pregunta (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ preguntaId: string }> }
) {
  try {
    const { preguntaId } = await params

    const { data, error } = await supabase
      .from("encuesta_preguntas")
      .update({
        activo: false,
      })
      .eq("id", preguntaId)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting pregunta:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
