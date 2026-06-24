import { RoleAwareModulePage } from "@/components/roles/role-aware-module-page"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { SurveyBuilder } from "@/components/survey/survey-builder"
import { getPerfilContext } from "@/lib/perfil"
import { getDynamicSurveys } from "@/lib/dynamic-surveys"

export default async function DiagnosticoPage() {
  const ctx = await getPerfilContext()
  if (ctx.rolRaw === "mujer_emprendedora") {
    redirect("/")
  }
  if (ctx.rolRaw === "administradora") {
    const surveys = await getDynamicSurveys()
    return <AppShell><Toolbar titulo="Diagnostico (Encuesta)" descripcion="Constructor de encuestas dinamicas y condicionales" showControls={false} /><SurveyBuilder surveys={surveys} /></AppShell>
  }

  return <RoleAwareModulePage moduleKey="diagnostico" />
}
