import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function registrarIngresoUsuario(userId: string, ruta = "/", userAgent: string | null = null) {
  const supabase = createAdminClient()

  const { data: perfil } = await supabase
    .from("v_perfiles_usuario_con_rol")
    .select("id, nombre_completo, email, rol")
    .eq("id", userId)
    .maybeSingle()

  const { data: userData } = await supabase.auth.admin.getUserById(userId)

  const { error } = await supabase.from("historial_ingresos").insert({
    id_usuario: userId,
    nombre_usuario: perfil?.nombre_completo ?? userData.user?.user_metadata?.nombre_completo ?? null,
    email_usuario: perfil?.email ?? userData.user?.email ?? null,
    rol_usuario: perfil?.rol ?? null,
    ruta,
    user_agent: userAgent,
  })

  if (error) {
    throw new Error(error.message)
  }

  await supabase.from("perfiles_usuario").update({ ultimo_acceso: new Date().toISOString() }).eq("id", userId)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const userId = typeof body?.userId === "string" ? body.userId : ""
    const ruta = typeof body?.ruta === "string" && body.ruta.trim() ? body.ruta.trim() : "/"

    if (!userId) {
      return NextResponse.json({ ok: false, message: "Falta userId" }, { status: 400 })
    }

    await registrarIngresoUsuario(userId, ruta, request.headers.get("user-agent"))
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    )
  }
}
