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

// GET: Obtener encuesta con bloques y preguntas
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = await params

    const { data: encuesta, error: errorEncuesta } = await supabase
      .from("encuestas")
      .select("*")
      .eq("id", id)
      .eq("activo", true)
      .single()

    if (errorEncuesta) throw errorEncuesta

    const { data: bloques, error: errorBloques } = await supabase
      .from("encuesta_bloques")
      .select(
        `
        id,
        titulo,
        descripcion,
        orden,
        estado,
        encuesta_preguntas(
          id,
          pregunta,
          tipo,
          opciones,
          texto_ayuda,
          requerido,
          orden,
          visible_cuando,
          estado
        )
      `
      )
      .eq("encuesta_id", id)
      .eq("activo", true)
      .order("orden")

    if (errorBloques) throw errorBloques

    return NextResponse.json({
      ...encuesta,
      bloques: bloques || [],
    })
  } catch (error: any) {
    console.error("[v0] Error fetching survey:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT: Actualizar encuesta (título, descripción)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = await params
    const body = await request.json()
    const { titulo, descripcion, estado } = body

    const { data, error } = await supabase
      .from("encuestas")
      .update({
        titulo: titulo || undefined,
        descripcion: descripcion || undefined,
        estado: estado !== undefined ? estado : undefined,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("[v0] Error updating survey:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PATCH: Ocultar/Mostrar encuesta (soft delete)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = await params
    const body = await request.json()
    const { estado } = body

    if (estado === undefined) {
      return NextResponse.json(
        { error: "El campo 'estado' es requerido" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("encuestas")
      .update({
        estado,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("[v0] Error patching survey:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar encuesta (soft delete - marca como inactiva)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = await params

    const { data, error } = await supabase
      .from("encuestas")
      .update({
        activo: false,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting survey:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
