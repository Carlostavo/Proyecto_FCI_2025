import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const TABLES = [
  "roles",
  "perfiles_usuario",
  "roles_usuario",
  "cursos_formativos",
  "participantes_cursos",
  "actividades_participante",
  "encuestas_validacion",
  "proyecto_informacion",
  "documentos_proyecto",
  "configuracion_encuestas",
  "materiales_curso",
  "evaluaciones_curso",
  "indicadores_proyecto",
  "productos_cientificos",
  "reportes_generados",
  "notificaciones",
  "certificados_participante",
  "retroalimentacion_participante",
  "validaciones_expertas",
  "ajustes_metodologicos",
  "configuracion_proyecto",
  "cursos",
  "tareas_curso",
  "entregas_tarea",
  "modulos_curso",
  "calificaciones_entrega",
  "encuesta_participantes",
  "encuesta_preguntas_auditoria",
  "encuestas",
  "encuesta_bloques",
  "encuesta_preguntas",
  "encuesta_respuestas",
  "encuesta_auditoria",
  "cuestionario_limpio_respuestas",
  "productos_cientificos_investigadores",
  "curso_participantes",
  "historial_ingresos",
] as const

export async function GET() {
  const supabase = createAdminClient()
  const exportData: Record<string, unknown[]> = {}

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select("*")
    exportData[table] = error || !data ? [] : data
  }

  const body = JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      tables: exportData,
    },
    null,
    2,
  )

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="bd_export_${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
