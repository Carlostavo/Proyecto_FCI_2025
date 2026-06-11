import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { ConfiguracionTabs } from "@/components/configuracion/configuracion-tabs"
import { obtenerUsuarios } from "@/lib/usuarios-actions"

export default async function ConfiguracionPage() {
  const usuarios = await obtenerUsuarios()

  return (
    <AppShell>
      <Toolbar
        titulo="Configuración"
        descripcion="Gestión de usuarios, roles, indicadores y periodos de evaluación"
        showControls={false}
      />
      <div className="px-6 pb-8">
        <ConfiguracionTabs usuarios={usuarios.map(u => ({
          id: u.id,
          nombre_completo: u.nombre_completo,
          email: u.email,
          rol: u.rol,
          activa: u.activa
        }))} />
      </div>
    </AppShell>
  )
}
