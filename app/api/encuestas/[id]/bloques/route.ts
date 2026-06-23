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

// POST: Crear bloque en una encuesta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient()
    const { id } = await params
    const body = await request.json()
    const { titulo, descripcion } = body

    if (!titulo) {
      return NextResponse.json(
        { error: "El título es requerido" },
        { status: 400 }
      )
    }

    // Obtener el siguiente número de orden
    const { data: ultimoBloque } = await supabase
      .from("encuesta_bloques")
      .select("orden")
      .eq("encuesta_id", id)
      .order("orden", { ascending: false })
      .limit(1)

    const orden = (ultimoBloque?.[0]?.orden || 0) + 1

    const { data, error } = await supabase
      .from("encuesta_bloques")
      .insert({
        encuesta_id: id,
        titulo,
        descripcion: descripcion || null,
        orden,
        estado: true,
        activo: true,
      })
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating bloque:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
