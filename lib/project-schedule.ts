export type ProjectScheduleItem = {
  fase: string
  inicio: string
  fin: string
  responsable: string
  estado: "Planificado" | "En proceso" | "Completado"
  color: string
}

export const projectSchedule: ProjectScheduleItem[] = [
  { fase: "Diagnóstico", inicio: "2025-06-01", fin: "2026-06-30", responsable: "Administradora", estado: "Completado", color: "#2563EB" },
  { fase: "Formación inicial", inicio: "2026-07-01", fin: "2027-06-30", responsable: "Formadora", estado: "En proceso", color: "#0891B2" },
  { fase: "Validación y ajuste", inicio: "2027-07-01", fin: "2027-12-31", responsable: "Investigadora", estado: "Planificado", color: "#16A34A" },
  { fase: "Producción científica", inicio: "2026-06-01", fin: "2028-06-30", responsable: "Equipo de investigación", estado: "En proceso", color: "#F59E0B" },
  { fase: "Sistematización", inicio: "2028-01-01", fin: "2028-05-31", responsable: "Investigadora", estado: "Planificado", color: "#F97316" },
  { fase: "Cierre y reporte final", inicio: "2028-06-01", fin: "2028-06-30", responsable: "Administradora", estado: "Planificado", color: "#7C3AED" },
]
