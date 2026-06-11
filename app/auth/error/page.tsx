import { AuthShell } from "@/components/auth/auth-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <AuthShell title="Algo salió mal" subtitle="No pudimos completar tu solicitud de autenticación">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            El enlace pudo haber expirado o ya fue utilizado. Intenta iniciar sesión nuevamente.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Volver a iniciar sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
