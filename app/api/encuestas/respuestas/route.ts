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

// POST: Guardar o actualizar respuesta
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { encuesta_id, sesion_id, pregunta_id, respuesta } = body

    if (!encuesta_id || !sesion_id || !pregunta_id) {
      return NextResponse.json(
        { error: "encuesta_id, sesion_id y pregunta_id son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que la sesión existe
    const { data: sesionExistente } = await supabase
      .from("encuesta_sesiones")
      .select("id")
      .eq("id", sesion_id)
      .eq("encuesta_id", encuesta_id)
      .single()

    if (!sesionExistente) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 }
      )
    }

    // Upsert: actualiza si existe, crea si no
    const { data, error } = await supabase
      .from("encuesta_respuestas")
      .upsert({
        sesion_id,
        pregunta_id,
        encuesta_id,
        respuesta: respuesta || null,
        actualizada_en: new Date().toISOString(),
      }, {
        onConflict: "sesion_id,pregunta_id"
      })
      .select()

    if (error) throw error

    // Actualizar última actividad de la sesión
    await supabase
      .from("encuesta_sesiones")
      .update({ ultima_actividad: new Date().toISOString() })
      .eq("id", sesion_id)

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error saving response:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// GET: Obtener respuestas de una sesión
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sesion_id = searchParams.get("sesion_id")
    const encuesta_id = searchParams.get("encuesta_id")

    if (!sesion_id || !encuesta_id) {
      return NextResponse.json(
        { error: "sesion_id y encuesta_id son requeridos" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("encuesta_respuestas")
      .select("*")
      .eq("sesion_id", sesion_id)
      .eq("encuesta_id", encuesta_id)
      .order("actualizada_en", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error fetching responses:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
