import { createClient } from "@/lib/supabase/server"

export type DynamicQuestion = { id: string; bloque_id: string; pregunta: string; tipo: string; opciones: string[]; texto_ayuda: string | null; requerido: boolean; orden: number; visible_cuando: { pregunta_id?: string; operador?: string; valor?: string } | null }
export type DynamicBlock = { id: string; encuesta_id: string; titulo: string; descripcion: string | null; orden: number; preguntas: DynamicQuestion[] }
export type DynamicSurvey = { id: string; titulo: string; descripcion: string | null; activo: boolean; bloques: DynamicBlock[] }

export async function getDynamicSurveys(): Promise<DynamicSurvey[]> {
  const supabase = await createClient()
  const [{ data: surveys }, { data: blocks }, { data: questions }] = await Promise.all([
    supabase.from("encuestas").select("id, titulo, descripcion, activo").order("creado_en"),
    supabase.from("encuesta_bloques").select("id, encuesta_id, titulo, descripcion, orden").order("orden"),
    supabase.from("encuesta_preguntas").select("id, bloque_id, pregunta, tipo, opciones, texto_ayuda, requerido, orden, visible_cuando").order("orden"),
  ])
  return (surveys ?? []).map((survey) => ({
    ...survey,
    bloques: (blocks ?? []).filter((block) => block.encuesta_id === survey.id).map((block) => ({
      ...block,
      preguntas: (questions ?? []).filter((question) => question.bloque_id === block.id).map((question) => ({
        ...question,
        opciones: Array.isArray(question.opciones) ? question.opciones : ((question.opciones as { opciones?: string[] } | null)?.opciones ?? []),
      })) as DynamicQuestion[],
    })),
  })) as DynamicSurvey[]
}
