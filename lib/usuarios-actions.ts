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

export async function crearUsuario(
  email: string,
  nombreCompleto: string,
  rol: string,
): Promise<{ ok: boolean; message: string; userId?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) return { ok: false, message: "No autenticado." }

    // Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // Contraseña temporal
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return { ok: false, message: authError?.message ?? "Error al crear usuario." }
    }

    const newUserId = authData.user.id

    // Crear perfil
    const { error: profileError } = await supabase
      .from("perfiles_usuario")
      .insert({
        id: newUserId,
        nombre_completo: nombreCompleto,
        email,
        cuenta_activa: true,
      })

    if (profileError) {
      return { ok: false, message: profileError.message }
    }

    // Asignar rol
    const { error: roleError } = await supabase
      .from("roles_usuario")
      .insert({
        id_usuario: newUserId,
        rol,
      })

    if (roleError) {
      return { ok: false, message: roleError.message }
    }

    return { ok: true, message: "Usuario creado exitosamente.", userId: newUserId }
  } catch (error) {
    console.error("[v0] Error en crearUsuario:", error)
    return { ok: false, message: String(error) }
  }
}

export async function actualizarUsuario(
  userId: string,
  data: Partial<Usuario>,
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) return { ok: false, message: "No autenticado." }

    // Actualizar perfil
    const { error: profileError } = await supabase
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

    if (profileError) return { ok: false, message: profileError.message }

    // Actualizar rol si se proporciona
    if (data.rol) {
      const rolDbValue = data.rol.toLowerCase().replace(/\s+/g, "_")
      const { error: roleError } = await supabase
        .from("roles_usuario")
        .update({ rol: rolDbValue })
        .eq("id_usuario", userId)

      if (roleError) return { ok: false, message: roleError.message }
    }

    return { ok: true, message: "Usuario actualizado." }
  } catch (error) {
    console.error("[v0] Error en actualizarUsuario:", error)
    return { ok: false, message: String(error) }
  }
}

export async function eliminarUsuario(userId: string): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) return { ok: false, message: "No autenticado." }

    // Eliminar rol
    const { error: roleError } = await supabase
      .from("roles_usuario")
      .delete()
      .eq("id_usuario", userId)

    if (roleError) return { ok: false, message: roleError.message }

    // Desactivar perfil (no eliminar para mantener historial)
    const { error: profileError } = await supabase
      .from("perfiles_usuario")
      .update({
        cuenta_activa: false,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) return { ok: false, message: profileError.message }

    return { ok: true, message: "Usuario eliminado." }
  } catch (error) {
    console.error("[v0] Error en eliminarUsuario:", error)
    return { ok: false, message: String(error) }
  }
}
