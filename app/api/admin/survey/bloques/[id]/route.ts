import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Soft delete (marcar como inactivo)
    const { error } = await supabase
      .from("encuesta_bloques")
      .update({ activo: false })
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error en DELETE /api/admin/survey/bloques/[id]:", error)
    return NextResponse.json(
      { error: "Error eliminando bloque" },
      { status: 500 }
    )
  }
}
