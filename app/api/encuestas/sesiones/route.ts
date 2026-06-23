import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST: Crear o recuperar sesión para encuesta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { encuesta_id, id_sesion } = body

    if (!encuesta_id) {
      return NextResponse.json(
        { error: "encuesta_id es requerido" },
        { status: 400 }
      )
    }

    // Si ya existe id_sesion, verificar que sea válida
    if (id_sesion) {
      const { data: sesionExistente } = await supabase
        .from("encuesta_sesiones")
        .select("*")
        .eq("id_sesion", id_sesion)
        .eq("encuesta_id", encuesta_id)
        .single()

      if (sesionExistente) {
        // Actualizar última actividad
        await supabase
          .from("encuesta_sesiones")
          .update({ ultima_actividad: new Date().toISOString() })
          .eq("id", sesionExistente.id)

        return NextResponse.json(sesionExistente)
      }
    }

    // Crear nueva sesión con ID único anónimo
    const nuevoIdSesion = `sesion_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`

    const { data, error } = await supabase
      .from("encuesta_sesiones")
      .insert({
        encuesta_id,
        id_sesion: nuevoIdSesion,
        creada_en: new Date().toISOString(),
        ultima_actividad: new Date().toISOString(),
        completada: false,
      })
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating session:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PATCH: Marcar encuesta como completada
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { sesion_id, completada } = body

    if (!sesion_id || completada === undefined) {
      return NextResponse.json(
        { error: "sesion_id y completada son requeridos" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("encuesta_sesiones")
      .update({ completada })
      .eq("id_sesion", sesion_id)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("[v0] Error updating session:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
