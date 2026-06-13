"use client"

import { ConfiguracionTabs } from "./configuracion-tabs"

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
  const esAdmin = initialRol === "administradora"

  return <ConfiguracionTabs usuarios={usuarios} esAdmin={esAdmin} />
}
