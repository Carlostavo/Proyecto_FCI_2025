import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { ConfiguracionTabs } from "@/components/configuracion/configuracion-tabs"

export default function ConfiguracionPage() {
  return (
    <AppShell>
      <Toolbar
        titulo="Configuración"
        descripcion="Gestión de usuarios, roles, indicadores y periodos de evaluación"
        showControls={false}
      />
      <div className="px-6 pb-8">
        <ConfiguracionTabs />
      </div>
    </AppShell>
  )
}
