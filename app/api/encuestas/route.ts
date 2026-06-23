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

// GET: Obtener todas las encuestas activas
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("encuestas")
      .select("*")
      .eq("activo", true)
      .eq("estado", true)
      .order("creado_en", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error fetching surveys:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST: Crear nueva encuesta (administradora)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { titulo, descripcion, es_inicial } = body

    if (!titulo) {
      return NextResponse.json(
        { error: "El título es requerido" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("encuestas")
      .insert({
        titulo,
        descripcion: descripcion || null,
        es_inicial: es_inicial || false,
        estado: true,
        activo: true,
      })
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating survey:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
