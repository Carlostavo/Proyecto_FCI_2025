import { Sidebar } from "@/components/dashboard/sidebar"
import { Header, Toolbar } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { ProjectTimeChart } from "@/components/dashboard/project-time-chart"
import { ResearcherProductionChart } from "@/components/dashboard/researcher-production-chart"
import { CompetenciesHeatmap } from "@/components/dashboard/competencies-heatmap"
import { TrainingNeedsChart } from "@/components/dashboard/training-needs-chart"
import { CourseStatusChart } from "@/components/dashboard/course-status-chart"
import { UpcomingActivities } from "@/components/dashboard/upcoming-activities"
import { createClient } from "@/lib/supabase/server"

const ROLES_LABEL: Record<string, string> = {
  administradora: "Administradora",
  investigadora: "Investigadora",
  formadora: "Formadora",
  mujer_emprendedora: "Mujer emprendedora",
  institucion_aliada: "Institución aliada",
}

export default async function Page() {
  let nombre = "Usuario"
  let rol = "Miembro del proyecto"

  // Solo consultamos Supabase si las variables de entorno están configuradas.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      nombre = (user.user_metadata?.nombre_completo as string) || user.email || "Usuario"

      // Nombre desde el perfil (si existe). Tabla: perfiles_usuario
      const { data: perfil } = await supabase
        .from("perfiles_usuario")
        .select("nombre_completo")
        .eq("id", user.id)
        .maybeSingle()
      if (perfil?.nombre_completo) nombre = perfil.nombre_completo

      // Rol desde roles_usuario. Ajusta "id_usuario" si tu columna se llama distinto.
      const { data: rolData } = await supabase
        .from("roles_usuario")
        .select("rol")
        .eq("id_usuario", user.id)
        .maybeSingle()
      if (rolData?.rol) rol = ROLES_LABEL[rolData.rol] ?? rolData.rol
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header nombre={nombre} rol={rol} />
        <main className="flex-1 overflow-y-auto">
          <Toolbar />
          <div className="space-y-4 px-6 pb-8">
            <StatCards />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ProjectTimeChart />
              <ResearcherProductionChart />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CompetenciesHeatmap />
              <TrainingNeedsChart />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <CourseStatusChart />
              <div className="lg:col-span-2">
                <UpcomingActivities />
              </div>
            </div>
          </div>

          <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
            © 2026 Universidad de Guayaquil · Plataforma de Gestión de Proyectos FCI
          </footer>
        </main>
      </div>
    </div>
  )
}
