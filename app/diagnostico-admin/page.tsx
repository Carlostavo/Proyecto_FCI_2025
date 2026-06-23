import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getPerfilContext } from "@/lib/perfil"
import { SurveyManagerAdmin } from "@/components/survey/survey-manager-admin"
import { redirect } from "next/navigation"

export default async function DiagnosticoAdminPage() {
  const ctx = await getPerfilContext()

  // Solo administradoras pueden acceder
  if (ctx.rolRaw !== "administradora") {
    redirect("/diagnostico")
  }

  return (
    <AppShell>
      <Toolbar
        titulo="Configuración de Encuesta Dinámica"
        descripcion="Crea y gestiona bloques de preguntas con condiciones de visibilidad. Los cambios se reflejan automáticamente en la encuesta de emprendedoras."
        showControls={false}
      />
      <div className="px-6 pb-8">
        <SurveyManagerAdmin />
      </div>
    </AppShell>
  )
}
