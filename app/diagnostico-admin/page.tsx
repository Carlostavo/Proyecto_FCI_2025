import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getPerfilContext } from "@/lib/perfil"
import { SurveyQuestionManager } from "@/components/survey/survey-question-manager"
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
        titulo="Configuración de Encuesta"
        descripcion="Gestiona las preguntas y condiciones dinámicas de la encuesta diagnóstica"
        showControls={false}
      />
      <div className="px-6 pb-8">
        <SurveyQuestionManager />
      </div>
    </AppShell>
  )
}
