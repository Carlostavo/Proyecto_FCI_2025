"use server"

import { revalidatePath } from "next/cache"
import { obtenerRolUsuario } from "@/lib/roles"
import { createClient } from "@/lib/supabase/server"

const TYPES = ["articulo_scopus", "articulo_latindex", "ponencia", "capitulo_libro", "politica_publica"]
const STATES = ["pendiente", "en_redaccion", "en_revision", "publicado"]

async function context() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user ? await obtenerRolUsuario(supabase, user.id) : null
  return { supabase, user, allowed: Boolean(user && role && ["administradora", "investigadora"].includes(role)) }
}

export async function saveScientificProduct(formData: FormData) {
  const ctx = await context()
  if (!ctx.allowed || !ctx.user) return { ok: false, message: "No tienes permiso para gestionar publicaciones." }
  const id = String(formData.get("id") ?? "")
  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim()
  const tipo = String(formData.get("tipo") ?? "")
  const estado = String(formData.get("estado") ?? "")
  const evidencia = String(formData.get("evidencia_url") ?? "").trim() || null
  const investigadores = formData.getAll("investigadores").map(String).filter(Boolean)
  if (!titulo || !TYPES.includes(tipo) || !STATES.includes(estado) || !investigadores.length) {
    return { ok: false, message: "Completa titulo, tipo, estado y al menos un responsable." }
  }
  if (evidencia) {
    try { new URL(evidencia) } catch { return { ok: false, message: "La evidencia debe ser un enlace PDF o DOI valido." } }
  }
  const progress = { pendiente: 0, en_redaccion: 35, en_revision: 70, publicado: 100 }[estado] ?? 0
  const payload = { titulo, descripcion: descripcion || null, tipo, estado, avance: progress, responsable: investigadores[0], evidencia_url: evidencia, enlace: evidencia, fecha_actualizacion: new Date().toISOString() }
  let productId = id
  if (id) {
    const { error } = await ctx.supabase.from("productos_cientificos").update(payload).eq("id", id)
    if (error) return { ok: false, message: error.message }
  } else {
    const { data, error } = await ctx.supabase.from("productos_cientificos").insert(payload).select("id").single()
    if (error || !data) return { ok: false, message: error?.message ?? "No se pudo crear el producto." }
    productId = data.id
  }
  await ctx.supabase.from("productos_cientificos_investigadores").delete().eq("id_producto", productId)
  const { error: relationError } = await ctx.supabase.from("productos_cientificos_investigadores").insert(investigadores.map((investigator) => ({ id_producto: productId, id_investigador: investigator })))
  if (relationError) return { ok: false, message: relationError.message }
  revalidatePath("/")
  revalidatePath("/produccion")
  return { ok: true, message: id ? "Producto actualizado." : "Publicacion registrada." }
}

export async function deleteScientificProduct(id: string) {
  const ctx = await context()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const { error } = await ctx.supabase.from("productos_cientificos").delete().eq("id", id)
  if (error) return { ok: false, message: error.message }
  revalidatePath("/")
  revalidatePath("/produccion")
  return { ok: true, message: "Producto eliminado." }
}
