import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("encuesta_preguntas")
      .update(body)
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error en PATCH /api/admin/survey/preguntas/[id]:", error)
    return NextResponse.json(
      { error: "Error actualizando pregunta" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      pregunta,
      tipo_respuesta,
      opciones,
      ayuda,
      requerida,
      condicion_visible_json,
    } = await request.json()

    const { data, error } = await supabase
      .from("encuesta_preguntas")
      .update({
        pregunta,
        tipo_respuesta,
        opciones: opciones || null,
        ayuda: ayuda || null,
        requerida,
        condicion_visible_json: condicion_visible_json || null,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error en PUT /api/admin/survey/preguntas/[id]:", error)
    return NextResponse.json(
      { error: "Error actualizando pregunta" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Soft delete
    const { error } = await supabase
      .from("encuesta_preguntas")
      .update({ activo: false })
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error en DELETE /api/admin/survey/preguntas/[id]:", error)
    return NextResponse.json(
      { error: "Error eliminando pregunta" },
      { status: 500 }
    )
  }
}
