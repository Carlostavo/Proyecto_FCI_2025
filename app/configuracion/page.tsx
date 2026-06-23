import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { obtenerUsuarios } from "@/lib/usuarios-actions"
import { getRolActual } from "@/lib/perfil"
import { getProjectInfo } from "@/lib/project-info"
import { ConfiguracionClientWrapper } from "@/components/configuracion/configuracion-client-wrapper"

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  let usuarios: any[] = []
  let rolActual = null
  let projectInfo = null

  try {
    usuarios = await obtenerUsuarios()
  } catch (err) {
    console.error("[v0] Error obteniendo usuarios:", err)
  }

  try {
    rolActual = await getRolActual()
  } catch (err) {
    console.error("[v0] Error obteniendo rol actual:", err)
  }

  try {
    projectInfo = await getProjectInfo()
  } catch (err) {
    console.error("[v0] Error obteniendo info del proyecto:", err)
    projectInfo = null
  }

  return (
    <AppShell>
      <Toolbar
        titulo="Configuración"
        descripcion="Gestión de usuarios, roles, indicadores y periodos de evaluación"
        showControls={false}
      />
      <div className="px-6 pb-8">
        <ConfiguracionClientWrapper
          usuarios={usuarios && Array.isArray(usuarios) ? usuarios.map(u => ({
            id: u.id,
            nombre_completo: u.nombre_completo,
            email: u.email,
            rol: u.rol,
            activa: u.activa
          })) : []}
          initialRol={rolActual}
          projectInfo={projectInfo || undefined}
        />
      </div>
    </AppShell>
  )
}
