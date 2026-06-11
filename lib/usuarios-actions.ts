"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Usuario = {
  id: string
  nombre_completo: string | null
  email: string | null
  telefono: string | null
  breve_descripcion: string | null
  linkedin: string | null
  avatar_url: string | null
  notificaciones_activas: boolean
  rol: string
  activa: boolean
}

const ROLES_LABEL: Record<string, string> = {
  administradora:     "Administradora",
  investigadora:      "Investigadora",
  formadora:          "Formadora",
  mujer_emprendedora: "Mujer emprendedora",
  institucion_aliada: "Institución aliada",
}

const demoUsuarios: Usuario[] = [
  {
    id: "demo-1",
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
    id: "demo-2",
    nombre_completo: "Lucía Andrade Tello",
    email: "lucia.andrade@ug.edu.ec",
    telefono: "+593 9 9876 5432",
    breve_descripcion: "Formadora en temas de emprendimiento",
    linkedin: null,
    avatar_url: null,
    notificaciones_activas: true,
    rol: "Investigadora",
    activa: true,
  },
  {
    id: "demo-3",
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
    id: "demo-4",
    nombre_completo: "Rosa Maldonado",
    email: "rosa.m@ejemplo.com",
    telefono: null,
    breve_descripcion: "Participante emprendedora",
    linkedin: null,
    avatar_url: null,
    notificaciones_activas: false,
    rol: "Mujer emprendedora",
    activa: false,
  },
]

export async function obtenerUsuarios(): Promise<Usuario[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return demoUsuarios

    // Con RLS activa, la administradora puede ver todos los registros
    const { data, error } = await supabase
      .from("perfiles_usuario")
      .select("id, nombre_completo, email, telefono, breve_descripcion, rol, linkedin, avatar_url, notificaciones_activas, cuenta_activa")
      .order("nombre_completo", { ascending: true })

    if (error || !data || data.length === 0) return demoUsuarios

    return data.map((p) => ({
      id: p.id,
      nombre_completo: p.nombre_completo,
      email: p.email,
      telefono: p.telefono,
      breve_descripcion: p.breve_descripcion,
      linkedin: p.linkedin,
      avatar_url: p.avatar_url,
      notificaciones_activas: p.notificaciones_activas ?? true,
      rol: p.rol ? (ROLES_LABEL[p.rol] ?? p.rol) : "Sin rol",
      activa: p.cuenta_activa ?? true,
    }))
  } catch {
    return demoUsuarios
  }
}

export async function crearUsuario(
  email: string,
  nombreCompleto: string,
  rol: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: "No autenticado." }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12),
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return { ok: false, message: authError?.message ?? "Error al crear usuario." }
    }

    const newUserId = authData.user.id

    const { error: profileError } = await supabase
      .from("perfiles_usuario")
      .insert({
        id: newUserId,
        nombre_completo: nombreCompleto,
        email,
        rol,
        cuenta_activa: true,
      })

    if (profileError) return { ok: false, message: profileError.message }

    revalidatePath("/configuracion")
    return { ok: true, message: "Usuario creado exitosamente." }
  } catch (e) {
    return { ok: false, message: String(e) }
  }
}

export async function actualizarUsuario(
  userId: string,
  data: Partial<Pick<Usuario, "nombre_completo" | "email" | "telefono" | "breve_descripcion" | "linkedin" | "rol" | "activa">>,
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: "No autenticado." }

    // Convertir etiqueta legible → valor ENUM si viene como "Investigadora" → "investigadora"
    const rolEnum = data.rol
      ? Object.entries(ROLES_LABEL).find(([, v]) => v === data.rol)?.[0] ?? data.rol.toLowerCase().replace(/\s+/g, "_")
      : undefined

    const { error } = await supabase
      .from("perfiles_usuario")
      .update({
        nombre_completo:      data.nombre_completo,
        email:                data.email,
        telefono:             data.telefono,
        breve_descripcion:    data.breve_descripcion,
        linkedin:             data.linkedin,
        ...(rolEnum ? { rol: rolEnum } : {}),
        cuenta_activa:        data.activa,
        fecha_actualizacion:  new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) return { ok: false, message: error.message }

    revalidatePath("/configuracion")
    return { ok: true, message: "Usuario actualizado." }
  } catch (e) {
    return { ok: false, message: String(e) }
  }
}

export async function eliminarUsuario(userId: string): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: "No autenticado." }

    const { error } = await supabase
      .from("perfiles_usuario")
      .update({ cuenta_activa: false, fecha_actualizacion: new Date().toISOString() })
      .eq("id", userId)

    if (error) return { ok: false, message: error.message }

    revalidatePath("/configuracion")
    return { ok: true, message: "Usuario desactivado." }
  } catch (e) {
    return { ok: false, message: String(e) }
  }
}
