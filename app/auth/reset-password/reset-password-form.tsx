"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [verifyingSession, setVerifyingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const verifySession = async () => {
      const verified = searchParams.get("verified")
      const code = searchParams.get("code")

      console.log("[v0] Reset Password - verified:", verified, "code:", code ? "present" : "absent")

      // Si tiene un code, intentar intercambiarlo usando el cliente de Supabase
      if (code && !verified) {
        console.log("[v0] Attempting to exchange code for session...")
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error("[v0] Error exchanging code:", exchangeError.message)
            // El codigo ya fue usado o es invalido, verificar si ya hay sesion
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
              console.log("[v0] Found existing session after failed exchange")
              setHasValidSession(true)
              setVerifyingSession(false)
              return
            }

            setError("El enlace de recuperación ha expirado o no es válido. Por favor, solicita uno nuevo.")
            setVerifyingSession(false)
            return
          }

          if (data?.session) {
            console.log("[v0] Code exchanged successfully, session established")
            setHasValidSession(true)
            setVerifyingSession(false)
            return
          }
        } catch (err) {
          console.error("[v0] Exception exchanging code:", err)
        }
      }

      // Verificar si ya hay una sesion activa
      try {
        console.log("[v0] Checking for existing session...")
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          console.log("[v0] Valid session found for user:", session.user.email)
          setHasValidSession(true)
          setVerifyingSession(false)
          return
        }

        console.log("[v0] No valid session found")
        // No hay sesion valida
        if (!verified && !code) {
          setError("El enlace de recuperación no es válido. Por favor, solicita uno nuevo.")
        } else if (verified) {
          // Vino del callback pero no hay sesion - puede ser que las cookies no se establecieron
          setError("No se pudo establecer la sesión. Por favor, solicita un nuevo enlace de recuperación.")
        } else {
          setError("Tu sesión ha expirado. Por favor, solicita un nuevo enlace de recuperación.")
        }
        setVerifyingSession(false)
      } catch (err) {
        console.error("[v0] Error verifying session:", err)
        setError("Error al verificar la sesión. Por favor, intenta nuevamente.")
        setVerifyingSession(false)
      }
    }

    verifySession()
  }, [searchParams, supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Updating password...")
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        console.error("[v0] Error updating password:", updateError.message)
        setError(updateError.message || "Error al actualizar la contraseña")
        setLoading(false)
        return
      }

      console.log("[v0] Password updated successfully")
      setSuccess(true)
      setLoading(false)

      // Cerrar sesión después de cambiar la contraseña
      await supabase.auth.signOut()

      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err: any) {
      console.error("[v0] Exception updating password:", err)
      setError(err.message || "Ocurrió un error al actualizar la contraseña")
      setLoading(false)
    }
  }

  if (verifyingSession) {
    return (
      <AuthShell
        title="Verificando..."
        subtitle="Por favor espera"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Verificando tu enlace de recuperación...
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  if (success) {
    return (
      <AuthShell
        title="Contraseña actualizada"
        subtitle="Tu contraseña ha sido cambiada exitosamente"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-5 text-center">
              <p className="text-sm text-muted-foreground">
                Serás redirigido al inicio de sesión en unos momentos.
              </p>
              <Link href="/auth/login">
                <Button className="w-full">
                  Ir al Inicio de Sesión
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  // Si no hay sesión válida, mostrar el error
  if (!hasValidSession && error) {
    return (
      <AuthShell
        title="Enlace Inválido"
        subtitle="Hubo un problema con tu solicitud"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-5 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Link href="/auth/forgot-password">
                <Button className="w-full">
                  Solicitar Nuevo Enlace
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Restablecer Contraseña"
      subtitle="Ingresa tu nueva contraseña"
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu nueva contraseña"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar contraseña"
                )}
              </Button>
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="font-medium text-primary underline underline-offset-4">
                Volver al inicio de sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
