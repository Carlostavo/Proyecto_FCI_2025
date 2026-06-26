import { FormationCatalog } from "@/components/courses/formation-catalog"
import { RoleAwareModulePage } from "@/components/roles/role-aware-module-page"
import { getPerfilContext } from "@/lib/perfil"
import { getCursosAsignadosUsuario, getTareasAsignadasUsuario } from "@/lib/cursos"

export default async function MallaFormativaPage() {
  const ctx = await getPerfilContext()
  if (ctx.rolRaw === "mujer_emprendedora") {
    const [cursos, tareas] = await Promise.all([getCursosAsignadosUsuario(), getTareasAsignadasUsuario()])
    return <FormationCatalog cursos={cursos} tareas={tareas} />
  }

  return <RoleAwareModulePage moduleKey="malla" />
}
