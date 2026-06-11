"use client"

import { useState, useEffect } from "react"
import { ConfiguracionTabs } from "./configuracion-tabs"
import { AdminModeToggle } from "./admin-mode-toggle"

type Usuario = {
  id: string
  nombre_completo: string | null
  email: string | null
  rol: string
  activa: boolean
}

export function ConfiguracionClientWrapper({
  usuarios,
  initialRol,
}: {
  usuarios: Usuario[]
  initialRol: string | null
}) {
  const [esAdmin, setEsAdmin] = useState(initialRol === "administradora")

  useEffect(() => {
    // En desarrollo, verificar mode admin via localStorage
    const devAdmin = localStorage.getItem("dev_admin_mode") === "true"
    if (devAdmin && !initialRol) {
      setEsAdmin(true)
    } else {
      setEsAdmin(initialRol === "administradora")
    }
  }, [initialRol])

  return (
    <>
      <ConfiguracionTabs usuarios={usuarios} esAdmin={esAdmin} />
      <AdminModeToggle onToggle={setEsAdmin} />
    </>
  )
}
