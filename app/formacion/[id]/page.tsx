import { notFound, redirect } from "next/navigation"
import { CourseViewer } from "@/components/courses/course-viewer"
import { getCurso, getEntregasUsuario, getModulosCurso, getTareasPorCurso, usuarioTieneCursoAsignado } from "@/lib/cursos"
import { getPerfilContext } from "@/lib/perfil"

export default async function CursoFormacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getPerfilContext()
  if (ctx.rolRaw !== "mujer_emprendedora") redirect("/")
  const asignado = await usuarioTieneCursoAsignado(id)
  if (!asignado) redirect("/malla-formativa")

  const [curso, modulos, tareas, entregas] = await Promise.all([
    getCurso(id, false),
    getModulosCurso(id, false),
    getTareasPorCurso(id, false),
    getEntregasUsuario(),
  ])
  if (!curso) notFound()

  return <CourseViewer curso={curso} modulos={modulos} tareas={tareas} entregas={entregas} />
}
