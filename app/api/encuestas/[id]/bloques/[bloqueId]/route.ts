import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// PUT: Actualizar bloque
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bloqueId: string }> }
) {
  try {
    const { bloqueId } = await params
    const body = await request.json()
    const { titulo, descripcion, estado } = body

    const { data, error } = await supabase
      .from("encuesta_bloques")
      .update({
        titulo: titulo || undefined,
        descripcion: descripcion || undefined,
        estado: estado !== undefined ? estado : undefined,
      })
      .eq("id", bloqueId)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("[v0] Error updating bloque:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar bloque (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bloqueId: string }> }
) {
  try {
    const { bloqueId } = await params

    const { data, error } = await supabase
      .from("encuesta_bloques")
      .update({
        activo: false,
      })
      .eq("id", bloqueId)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting bloque:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
