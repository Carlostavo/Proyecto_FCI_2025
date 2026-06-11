import { AuthShell } from "@/components/auth/auth-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MailCheck } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <AuthShell title="Revisa tu correo" subtitle="Tu cuenta fue creada correctamente">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <MailCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            Te enviamos un enlace de confirmación. Confirma tu correo electrónico para activar tu cuenta y poder iniciar
            sesión.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Volver a iniciar sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
