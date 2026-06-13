import { createClient } from "@/lib/supabase/server"
import { toTitleCase } from "@/lib/format"

export { toTitleCase }

export type Perfil = {
  id: string
  nombre_completo: string | null
  email: string | null
  telefono: string | null
  breve_descripcion: string | null
  rol: string | null
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
  administradora:     "Administradora",
  investigadora:      "Investigadora",
  formadora:          "Formadora",
  mujer_emprendedora: "Mujer emprendedora",
  institucion_aliada: "Institución aliada",
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

export type PerfilContext = {
  perfil: Perfil | null
  nombre: string
  rol: string
  rolRaw: string | null
  avatarUrl: string | null
  notificacionesActivas: boolean
}

function demoContext(): PerfilContext {
  return {
    perfil: null,
    nombre: "Usuario Invitado",
    rol: "Miembro del proyecto",
    rolRaw: null,
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
      "id, nombre_completo, email, telefono, breve_descripcion, rol, linkedin, avatar_url, notificaciones_activas",
    )
    .eq("id", user.id)
    .maybeSingle()

  // Nombre: usar nombre_completo del perfil; nunca mostrar el email como nombre
  const nombreBase =
    perfil?.nombre_completo?.trim() ||
    (user.user_metadata?.nombre_completo as string | undefined)?.trim() ||
    null

  const rolRaw = perfil?.rol ?? null

  return {
    perfil: (perfil as Perfil) ?? null,
    nombre: nombreBase ? toTitleCase(nombreBase) : "Sin nombre",
    rol: rolRaw ? (ROLES_LABEL[rolRaw] ?? rolRaw) : "Miembro del proyecto",
    rolRaw,
    avatarUrl: perfil?.avatar_url ?? null,
    notificacionesActivas: perfil?.notificaciones_activas ?? true,
  }
}

/** Obtiene el rol en bruto (minúsculas) del usuario autenticado. */
export async function getRolActual(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: perfil } = await supabase
    .from("perfiles_usuario")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle()

  return perfil?.rol ?? null
}

/** Notificaciones de ejemplo. Reemplazar por tabla real cuando exista. */
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
