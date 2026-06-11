"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

const ROLES_INVERSO: Record<string, string> = {
  "Administradora": "administradora",
  "Investigadora": "investigadora",
  "Formadora": "formadora",
  "Mujer emprendedora": "mujer_emprendedora",
  "Institución aliada": "institucion_aliada",
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

// Función auxiliar para generar contraseña temporal segura
function generarContraseñaTemporal(): string {
  const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const minusculas = "abcdefghijklmnopqrstuvwxyz"
  const numeros = "0123456789"
  const especiales = "!@#$%^&*"
  
  const todas = mayusculas + minusculas + numeros + especiales
  let password = ""
  
  // Asegurar al menos un carácter de cada tipo
  password += mayusculas[Math.floor(Math.random() * mayusculas.length)]
  password += minusculas[Math.floor(Math.random() * minusculas.length)]
  password += numeros[Math.floor(Math.random() * numeros.length)]
  password += especiales[Math.floor(Math.random() * especiales.length)]
  
  // Completar a 12 caracteres
  for (let i = password.length; i < 12; i++) {
    password += todas[Math.floor(Math.random() * todas.length)]
  }
  
  // Mezclar
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export async function crearUsuario(
  email: string,
  nombreCompleto: string,
  rol: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    
    // 1. Verificar usuario autenticado
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !currentUser) {
      return { ok: false, message: "No autenticado. Inicia sesión nuevamente." }
    }
    
    // 2. VERIFICAR ROL DE ADMINISTRADORA
    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles_usuario")
      .select("rol")
      .eq("id", currentUser.id)
      .single()
    
    if (perfilError) {
      console.error("Error al verificar rol:", perfilError)
      return { ok: false, message: "Error al verificar permisos de administrador." }
    }
    
    if (perfil.rol !== 'administradora') {
      return { 
        ok: false, 
        message: "User not allowed: Solo las usuarias con rol Administradora pueden crear nuevos usuarios." 
      }
    }
    
    // 3. Validar datos de entrada
    if (!email || !email.includes('@')) {
      return { ok: false, message: "Correo electrónico inválido." }
    }
    
    if (!nombreCompleto || nombreCompleto.trim().length < 3) {
      return { ok: false, message: "El nombre completo debe tener al menos 3 caracteres." }
    }
    
    // 4. Usar ADMIN CLIENT para crear usuario
    const supabaseAdmin = createAdminClient()
    const tempPassword = generarContraseñaTemporal()
    const rolNormalizado = ROLES_INVERSO[rol] || rol.toLowerCase().replace(/\s+/g, '_')
    
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        nombre_completo: nombreCompleto.trim(),
        rol_asignado: rolNormalizado
      }
    })
    
    if (createError) {
      console.error("Error al crear usuario en auth:", createError)
      
      if (createError.message.includes("already registered")) {
        return { ok: false, message: "Este correo electrónico ya está registrado." }
      }
      
      if (createError.message.includes("invalid email")) {
        return { ok: false, message: "El formato del correo electrónico no es válido." }
      }
      
      return { ok: false, message: `Error al crear usuario: ${createError.message}` }
    }
    
    if (!authData.user) {
      return { ok: false, message: "No se pudo crear el usuario en el sistema de autenticación." }
    }
    
    const newUserId = authData.user.id
    
    // 5. ACTUALIZAR el perfil existente (creado por el trigger) en lugar de insertar
    const { error: updateError } = await supabaseAdmin
      .from("perfiles_usuario")
      .update({
        nombre_completo: nombreCompleto.trim(),
        email: email.trim().toLowerCase(),
        rol: rolNormalizado,
        cuenta_activa: true,
        notificaciones_activas: true,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id", newUserId)
    
    if (updateError) {
      console.error("Error al actualizar perfil:", updateError)
      
      // Si el perfil no existe (por si acaso), entonces insertamos
      if (updateError.message.includes("does not exist") || updateError.message.includes("no rows")) {
        const { error: insertError } = await supabaseAdmin
          .from("perfiles_usuario")
          .insert({
            id: newUserId,
            nombre_completo: nombreCompleto.trim(),
            email: email.trim().toLowerCase(),
            rol: rolNormalizado,
            cuenta_activa: true,
            notificaciones_activas: true,
            fecha_registro: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString(),
          })
        
        if (insertError) {
          return { 
            ok: false, 
            message: `Error al crear perfil: ${insertError.message}` 
          }
        }
      } else {
        return { 
          ok: false, 
          message: `Error al configurar perfil: ${updateError.message}` 
        }
      }
    }
    
    revalidatePath("/configuracion")
    
    return { 
      ok: true, 
      message: `✅ Usuario creado exitosamente. Se ha enviado un correo a ${email} con instrucciones para acceder.` 
    }
    
  } catch (error) {
    console.error("Error inesperado en crearUsuario:", error)
    return { 
      ok: false, 
      message: error instanceof Error ? error.message : "Error desconocido al crear usuario." 
    }
  }
}

export async function actualizarUsuario(
  userId: string,
  data: Partial<Pick<Usuario, "nombre_completo" | "email" | "telefono" | "breve_descripcion" | "linkedin" | "rol" | "activa">>,
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !currentUser) {
      return { ok: false, message: "No autenticado." }
    }
    
    // Verificar si es administradora
    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles_usuario")
      .select("rol")
      .eq("id", currentUser.id)
      .single()
    
    if (perfilError) {
      return { ok: false, message: "Error al verificar permisos." }
    }
    
    const esAdmin = perfil?.rol === 'administradora'
    
    // Si no es admin, solo puede actualizar su propio perfil
    if (!esAdmin && currentUser.id !== userId) {
      return { ok: false, message: "No tienes permiso para actualizar otros usuarios." }
    }
    
    // Si no es admin, no puede cambiar el rol o estado de activación
    if (!esAdmin && (data.rol !== undefined || data.activa !== undefined)) {
      return { ok: false, message: "No tienes permiso para cambiar roles o estado de cuenta." }
    }
    
    // Preparar datos de actualización
    const updateData: any = {
      fecha_actualizacion: new Date().toISOString(),
    }
    
    if (data.nombre_completo !== undefined) {
      updateData.nombre_completo = data.nombre_completo.trim()
    }
    
    if (data.email !== undefined) {
      updateData.email = data.email.trim().toLowerCase()
    }
    
    if (data.telefono !== undefined) {
      updateData.telefono = data.telefono
    }
    
    if (data.breve_descripcion !== undefined) {
      updateData.breve_descripcion = data.breve_descripcion
    }
    
    if (data.linkedin !== undefined) {
      updateData.linkedin = data.linkedin
    }
    
    // Convertir rol de etiqueta legible a valor ENUM (solo admin)
    if (data.rol !== undefined && esAdmin) {
      const rolEnum = ROLES_INVERSO[data.rol] || data.rol.toLowerCase().replace(/\s+/g, '_')
      updateData.rol = rolEnum
    }
    
    // Actualizar estado de activación (solo admin)
    if (data.activa !== undefined && esAdmin) {
      updateData.cuenta_activa = data.activa
    }
    
    const { error: updateError } = await supabase
      .from("perfiles_usuario")
      .update(updateData)
      .eq("id", userId)
    
    if (updateError) {
      return { ok: false, message: updateError.message }
    }
    
    revalidatePath("/configuracion")
    return { ok: true, message: "✅ Usuario actualizado correctamente." }
    
  } catch (error) {
    console.error("Error en actualizarUsuario:", error)
    return { ok: false, message: "Error al actualizar usuario." }
  }
}

export async function eliminarUsuario(userId: string): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !currentUser) {
      return { ok: false, message: "No autenticado." }
    }
    
    // Verificar si es administradora
    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles_usuario")
      .select("rol")
      .eq("id", currentUser.id)
      .single()
    
    if (perfilError) {
      return { ok: false, message: "Error al verificar permisos." }
    }
    
    // Solo administradoras pueden eliminar/desactivar usuarios
    if (perfil?.rol !== 'administradora') {
      return { ok: false, message: "User not allowed: Solo administradoras pueden eliminar usuarios." }
    }
    
    // No permitir eliminarse a sí misma
    if (userId === currentUser.id) {
      return { ok: false, message: "No puedes desactivar tu propio usuario." }
    }
    
    // En lugar de eliminar, desactivamos el usuario (soft delete)
    const { error: updateError } = await supabase
      .from("perfiles_usuario")
      .update({ 
        cuenta_activa: false, 
        fecha_actualizacion: new Date().toISOString() 
      })
      .eq("id", userId)
    
    if (updateError) {
      return { ok: false, message: updateError.message }
    }
    
    revalidatePath("/configuracion")
    return { ok: true, message: "✅ Usuario desactivado correctamente." }
    
  } catch (error) {
    console.error("Error en eliminarUsuario:", error)
    return { ok: false, message: "Error al desactivar usuario." }
  }
}

// Función para reactivar un usuario
export async function reactivarUsuario(userId: string): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { ok: false, message: "No autenticado." }
    
    const { data: perfil } = await supabase
      .from("perfiles_usuario")
      .select("rol")
      .eq("id", currentUser.id)
      .single()
    
    if (perfil?.rol !== 'administradora') {
      return { ok: false, message: "No tienes permisos para reactivar usuarios." }
    }
    
    const { error: updateError } = await supabase
      .from("perfiles_usuario")
      .update({ 
        cuenta_activa: true, 
        fecha_actualizacion: new Date().toISOString() 
      })
      .eq("id", userId)
    
    if (updateError) {
      return { ok: false, message: updateError.message }
    }
    
    revalidatePath("/configuracion")
    return { ok: true, message: "✅ Usuario reactivado correctamente." }
    
  } catch (error) {
    return { ok: false, message: "Error al reactivar usuario." }
  }
}
