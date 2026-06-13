"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/dashboard/header"
import type { Notificacion } from "@/lib/perfil"

export function HeaderSync({
  initialNombre,
  initialRol,
  initialAvatarUrl,
  initialNotificacionesActivas,
  notificaciones,
}: {
  initialNombre: string
  initialRol: string
  initialAvatarUrl: string | null
  initialNotificacionesActivas: boolean
  notificaciones: Notificacion[]
}) {
  const [nombre, setNombre] = useState(initialNombre)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [notificacionesActivas, setNotificacionesActivas] = useState(initialNotificacionesActivas)

  useEffect(() => {
    // Escuchar cambios en localStorage (desde el formulario de perfil)
    const handleStorageChange = () => {
      const cached = localStorage.getItem("perfil_sync")
      if (cached) {
        try {
          const data = JSON.parse(cached)
          setNombre(data.nombre || initialNombre)
          setAvatarUrl(data.avatar_url || initialAvatarUrl)
          setNotificacionesActivas(data.notificaciones_activas ?? initialNotificacionesActivas)
          // Limpiar el flag
          localStorage.removeItem("perfil_sync")
        } catch (e) {
          console.error("[v0] Error parsing perfil_sync:", e)
        }
      }
    }

    // Escuchar eventos de Storage (para múltiples tabs)
    window.addEventListener("storage", handleStorageChange)
    
    // Escuchar custom event (para el mismo tab)
    window.addEventListener("perfil:updated", handleStorageChange as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("perfil:updated", handleStorageChange as EventListener)
    }
  }, [initialNombre, initialAvatarUrl, initialNotificacionesActivas])

  return (
    <Header
      nombre={nombre}
      rol={initialRol}
      avatarUrl={avatarUrl}
      notificacionesActivas={notificacionesActivas}
      notificaciones={notificaciones}
    />
  )
}
