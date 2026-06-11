import { createClient } from "@/lib/supabase/server"
import { toTitleCase } from "@/lib/format"

export { toTitleCase }

export type Perfil = {
  id: string
  nombre_completo: string | null
  email: string | null
  telefono: string | null
  breve_descripcion: string | null
  linkedin: string | null
  avatar_url: string | null
  notificaciones_activas: boolean
}

export type Notificacion = {
  id: string
  titulo: string
  mensaje: string
  fecha: string
  tipo: "info" | "alerta" | "exito"
  leida: boolean
}

const ROLES_LABEL: Record<string, string> = {
  administradora: "Administradora",
  investigadora: "Investigadora",
  formadora: "Formadora",
  mujer_emprendedora: "Mujer emprendedora",
  institucion_aliada: "Institución aliada",
}

/** Convierte cada palabra a mayúscula inicial: "maria perez" -> "Maria Perez" */

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

export type PerfilContext = {
  perfil: Perfil | null
  nombre: string
  rol: string
  avatarUrl: string | null
  notificacionesActivas: boolean
}

/** Datos de demostración mientras Supabase no esté vinculado. */
function demoContext(): PerfilContext {
  return {
    perfil: null,
    nombre: "Usuario Invitado",
    rol: "Miembro del proyecto",
    avatarUrl: null,
    notificacionesActivas: true,
  }
}

export async function getPerfilContext(): Promise<PerfilContext> {
  if (!isSupabaseConfigured()) return demoContext()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return demoContext()

  const { data: perfil } = await supabase
    .from("perfiles_usuario")
    .select(
      "id, nombre_completo, email, telefono, breve_descripcion, linkedin, avatar_url, notificaciones_activas",
    )
    .eq("id", user.id)
    .maybeSingle()

  const { data: rolData } = await supabase
    .from("roles_usuario")
    .select("rol")
    .eq("id_usuario", user.id)
    .maybeSingle()

  const nombreBase =
    perfil?.nombre_completo ||
    (user.user_metadata?.nombre_completo as string) ||
    user.email ||
    "Usuario"

  return {
    perfil: (perfil as Perfil) ?? null,
    nombre: toTitleCase(nombreBase),
    rol: rolData?.rol ? (ROLES_LABEL[rolData.rol] ?? rolData.rol) : "Miembro del proyecto",
    avatarUrl: perfil?.avatar_url ?? null,
    notificacionesActivas: perfil?.notificaciones_activas ?? true,
  }
}

/** Obtiene el rol en minúsculas del usuario actual (para comparaciones) */
export async function getRolActual(): Promise<string | null> {
  // En desarrollo sin Supabase, permitir override via localStorage para testing
  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      const overrideRol = localStorage.getItem("dev_rol_override")
      if (overrideRol) return overrideRol
    }
    return null
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: rolData } = await supabase
    .from("roles_usuario")
    .select("rol")
    .eq("id_usuario", user.id)
    .maybeSingle()

  return rolData?.rol ?? null
}

/** Notificaciones de ejemplo. Reemplazar por una tabla real cuando exista. */
export function getNotificacionesDemo(): Notificacion[] {
  return [
    {
      id: "1",
      titulo: "Nueva encuesta de validación",
      mensaje: "Se habilitó la encuesta del módulo 3 para las participantes.",
      fecha: "Hace 2 horas",
      tipo: "info",
      leida: false,
    },
    {
      id: "2",
      titulo: "Producto científico aprobado",
      mensaje: "El artículo sobre saberes ancestrales fue aceptado.",
      fecha: "Ayer",
      tipo: "exito",
      leida: false,
    },
    {
      id: "3",
      titulo: "Plazo próximo a vencer",
      mensaje: "La planificación del curso 4 vence en 3 días.",
      fecha: "Hace 2 días",
      tipo: "alerta",
      leida: true,
    },
  ]
}
