"use client"

import { Download } from "lucide-react"

export function EncuestaExportButton() {
  return (
    <a
      href="/api/export-encuesta"
      className="inline-flex items-center gap-2 rounded-md border border-primary bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
    >
      <Download className="h-4 w-4" />
      Descargar encuesta
    </a>
  )
}
