"use server"

import { createClient } from "@/lib/supabase/server"
import type { Perfil } from "@/lib/perfil"

export type Usuario = Perfil & {
  rol: string
  activa: boolean
}

export async function obtenerUsuarios(): Promise<Usuario[]> {
  const ROLES_LABEL: Record<string, string> = {
    administradora: "Administradora",
    investigadora: "Investigadora",
    formadora: "Formadora",
    mujer_emprendedora: "Mujer emprendedora",
    institucion_aliada: "Institución aliada",
  }

  // Datos de demostración si Supabase no está configurado
  const demoUsuarios: Usuario[] = [
    {
      id: "1",
      nombre_completo: "María Pérez Quishpe",
      email: "maria.perez@ug.edu.ec",
      telefono: "+593 9 1234 5678",
      breve_descripcion: "Investigadora principal del proyecto",
      linkedin: "https://linkedin.com/in/maria-perez",
      avatar_url: null,
      notificaciones_activas: true,
      rol: "Administradora",
      activa: true,
    },
    {
      id: "2",
      nombre_completo: "Lucía Andrade Tello",
      email: "lucia.andrade@ug.edu.ec",
      telefono: "+593 9 9876 5432",
      breve_descripcion: "Formadora en temas de emprendimiento",
      linkedin: "https://linkedin.com/in/lucia-andrade",
      avatar_url: null,
      notificaciones_activas: true,
      rol: "Investigadora",
      activa: true,
    },
    {
      id: "3",
      nombre_completo: "Sofía Caisaguano López",
      email: "sofia.c@ug.edu.ec",
      telefono: null,
      breve_descripcion: "Facilitadora de capacitaciones",
      linkedin: null,
      avatar_url: null,
      notificaciones_activas: true,
      rol: "Formadora",
      activa: true,
    },
    {
      id: "4",
      nombre_completo: "Rosa Maldonado",
      email: "rosa.m@ejemplo.com",
      telefono: null,
      breve_descripcion: "Mujer emprendedora participante",
      linkedin: null,
      avatar_url: null,
      notificaciones_activas: false,
      rol: "Mujer emprendedora",
      activa: false,
    },
  ]

  try {
    const supabase = await createClient()

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) return demoUsuarios

    // Obtener todos los perfiles
    const { data: perfiles, error: profilesError } = await supabase
      .from("perfiles_usuario")
      .select("id, nombre_completo, email, telefono, breve_descripcion, linkedin, avatar_url, notificaciones_activas, cuenta_activa")
      .returns<Array<Perfil & { cuenta_activa: boolean | null }>>()

    if (profilesError || !perfiles || perfiles.length === 0) return demoUsuarios

    // Obtener roles
    const { data: roles } = await supabase
      .from("roles_usuario")
      .select("id_usuario, rol")
      .returns<Array<{ id_usuario: string; rol: string }>>()

    const rolesMap = new Map(roles?.map((r) => [r.id_usuario, r.rol]) ?? [])

    return perfiles.map((p) => ({
      ...p,
      rol: rolesMap.get(p.id) ? ROLES_LABEL[rolesMap.get(p.id)!] ?? rolesMap.get(p.id)! : "Sin rol",
      activa: p.cuenta_activa ?? true,
    }))
  } catch (error) {
    console.error("[v0] Error en obtenerUsuarios:", error)
    return demoUsuarios
  }
}

export async function actualizarUsuario(
  userId: string,
  data: Partial<Usuario>,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) return { ok: false, message: "No autenticado." }

  const { error } = await supabase
    .from("perfiles_usuario")
    .update({
      nombre_completo: data.nombre_completo,
      email: data.email,
      telefono: data.telefono,
      breve_descripcion: data.breve_descripcion,
      linkedin: data.linkedin,
      avatar_url: data.avatar_url,
      cuenta_activa: data.activa,
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) return { ok: false, message: error.message }
  return { ok: true, message: "Usuario actualizado." }
}
