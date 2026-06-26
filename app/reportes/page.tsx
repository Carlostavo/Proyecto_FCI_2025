import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { EncuestaExportButton } from "@/components/reportes/encuesta-export-button"

export default async function ReportesPage() {
  return (
    <AppShell>
      <Toolbar titulo="Reportes" descripcion="Descarga la encuesta completa en Excel" showControls={false} />
      <div className="px-4 pb-8 sm:px-6">
        <section className="rounded-md border border-border bg-card">
          <header className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Encuesta</h3>
              <p className="text-sm text-muted-foreground">
                Descarga la tabla completa de <code className="rounded bg-muted px-1 py-0.5 text-xs">cuestionario_limpio_respuestas</code> con las 23 preguntas y todas las filas registradas.
              </p>
            </div>
            <EncuestaExportButton />
          </header>
          <div className="px-6 py-5 text-sm text-muted-foreground">
            El archivo se genera en formato <strong>.xlsx</strong> para abrirlo directamente en Excel o LibreOffice.
          </div>
        </section>
      </div>
    </AppShell>
  )
}
