import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getPerfilContext } from "@/lib/perfil"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Info } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DiagnosticoAdminPage() {
  const ctx = await getPerfilContext()
  // Solo administradoras pueden acceder
  if (ctx.rolRaw !== "administradora") {
    redirect("/diagnostico")
  }
  return (
    <AppShell>
      <Toolbar
        titulo="Gestión de Encuesta"
        descripcion="Monitor de la encuesta diagnóstica para emprendedoras"
        showControls={false}
      />
      <div className="px-6 pb-8 max-w-4xl mx-auto space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            La encuesta utiliza la tabla <code className="bg-white px-2 py-1 rounded">cuestionario_limpio_respuestas</code> para almacenar respuestas de forma anónima (sin user_id). Todas las respuestas se guardan automáticamente cuando las emprendedoras completan la encuesta en /diagnostico.
          </AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Encuesta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Características</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>30 preguntas organizadas temáticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Almacenamiento anónimo (sin user_id, usa sesión única)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Opción de guardar borradores</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Envío final de respuestas completas</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Tabla de Almacenamiento</h3>
              <p className="text-sm text-gray-600">
                <code className="bg-gray-100 px-2 py-1 rounded">cuestionario_limpio_respuestas</code>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Contiene 33 campos correspondientes a todas las preguntas de la encuesta.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Campos Clave</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <code className="bg-gray-100 px-1">marca_temporal</code> - Timestamp de la respuesta</li>
                <li>• Preguntas 1-30 organizadas en campos individuales</li>
                <li>• Sin campo user_id (totalmente anónimo)</li>
                <li>• Múltiples selecciones se guardan como texto separado por comas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">URLs Relacionadas</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  Encuesta para emprendedoras:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">/diagnostico</code>
                </li>
                <li>
                  API guardar borrador:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">/api/survey/save-draft</code>
                </li>
                <li>
                  API enviar encuesta:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">/api/survey/submit</code>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
