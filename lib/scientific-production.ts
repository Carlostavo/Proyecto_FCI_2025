import { createClient } from "@/lib/supabase/server"

export type Investigator = { id: string; nombre: string; email: string | null }
export type ScientificProduct = {
  id: string
  titulo: string
  descripcion: string | null
  tipo: "articulo_scopus" | "articulo_latindex" | "ponencia" | "capitulo_libro" | "politica_publica"
  estado: "pendiente" | "en_redaccion" | "en_revision" | "publicado"
  evidencia_url: string | null
  fecha_objetivo: string | null
  investigadores: Investigator[]
}

export async function getInvestigators(): Promise<Investigator[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("v_perfiles_usuario_con_rol")
    .select("id, nombre_completo, email, rol")
    .in("rol", ["administradora", "investigadora", "formadora", "institucion_aliada"])
    .order("nombre_completo")
  if (error || !data) return []
  return data.map((item) => ({ id: item.id, nombre: item.nombre_completo || item.email || "Sin nombre", email: item.email }))
}

export async function getScientificProducts(): Promise<ScientificProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("productos_cientificos")
    .select("id, titulo, descripcion, tipo, estado, evidencia_url, enlace, fecha_objetivo")
    .order("fecha_actualizacion", { ascending: false })
  if (error || !data) return []

  const ids = data.map((item) => item.id)
  const { data: assignments } = ids.length
    ? await supabase.from("productos_cientificos_investigadores").select("id_producto, id_investigador").in("id_producto", ids)
    : { data: [] }
  const investigatorIds = [...new Set((assignments ?? []).map((item) => item.id_investigador))]
  const { data: profiles } = investigatorIds.length
    ? await supabase.from("perfiles_usuario").select("id, nombre_completo, email").in("id", investigatorIds)
    : { data: [] }
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, {
    id: profile.id,
    nombre: profile.nombre_completo || profile.email || "Sin nombre",
    email: profile.email,
  }]))

  return data.map((item) => ({
    id: item.id,
    titulo: item.titulo,
    descripcion: item.descripcion,
    tipo: item.tipo as ScientificProduct["tipo"],
    estado: item.estado as ScientificProduct["estado"],
    evidencia_url: item.evidencia_url || item.enlace,
    fecha_objetivo: item.fecha_objetivo ?? null,
    investigadores: (assignments ?? [])
      .filter((assignment) => assignment.id_producto === item.id)
      .map((assignment) => profileMap.get(assignment.id_investigador))
      .filter((profile): profile is Investigator => Boolean(profile)),
  }))
}

export async function getProductionDashboardData() {
  const products = await getScientificProducts()
  const map = new Map<string, { investigador: string; planificado: number; ejecutado: number }>()
  for (const product of products) {
    for (const investigator of product.investigadores) {
      const current = map.get(investigator.id) ?? { investigador: investigator.nombre, planificado: 0, ejecutado: 0 }
      current.planificado += 1
      if (product.estado === "publicado") current.ejecutado += 1
      map.set(investigator.id, current)
    }
  }
  const completados = products.filter((product) => product.estado === "publicado").length
  return {
    resumen: {
      completados,
      meta: products.length,
      cumplimiento: products.length ? Math.round((completados / products.length) * 100) : 0,
    },
    investigadores: [...map.values()],
    productos: products,
  }
}
