"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export async function guardarPermisosRol(formData: FormData) {
  const rolCodigo = String(formData.get("rol_codigo") ?? "").trim()
  const seleccionados = formData
    .getAll("permisos")
    .map((valor) => String(valor).trim())
    .filter(Boolean)

  if (!rolCodigo) {
    return { ok: false, message: "Falta el rol a actualizar." }
  }

  const supabase = createAdminClient()
  const { data: rol, error: rolError } = await supabase.from("roles").select("id").eq("codigo", rolCodigo).maybeSingle()

  if (rolError || !rol) {
    return { ok: false, message: "No se encontro el rol." }
  }

  const { data: permisos, error: permisosError } = await supabase.from("permisos").select("id, codigo")

  if (permisosError) {
    return { ok: false, message: permisosError.message }
  }

  const idsSeleccionados = new Set(
    (permisos ?? [])
      .filter((permiso) => seleccionados.includes(permiso.codigo))
      .map((permiso) => permiso.id),
  )

  const { error: deleteError } = await supabase.from("roles_permisos").delete().eq("id_rol", rol.id)
  if (deleteError) return { ok: false, message: deleteError.message }

  if (idsSeleccionados.size > 0) {
    const filas = Array.from(idsSeleccionados).map((idPermiso) => ({ id_rol: rol.id, id_permiso: idPermiso }))
    const { error: insertError } = await supabase.from("roles_permisos").insert(filas)
    if (insertError) return { ok: false, message: insertError.message }
  }

  revalidatePath("/configuracion")
  return { ok: true, message: "Permisos actualizados correctamente." }
}
