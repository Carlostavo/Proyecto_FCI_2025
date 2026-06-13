"use client"

export const dynamic = 'force-dynamic'

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Intercambiar el código por una sesión válida
    const handleCodeExchange = async () => {
      try {
        const code = searchParams.get('code')
        
        if (!code) {
          setError("No se encontró código de recuperación. El enlace puede haber expirado.")
          return
        }

        console.log("[v0] Attempting to exchange code for session:", code.substring(0, 10) + "...")
        
        // Intercambiar el código por una sesión
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error("[v0] Code exchange error:", exchangeError)
          setError("El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.")
          return
        }

        // Verificar que la sesión se creó correctamente
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session || !session.user) {
          setError("No se pudo establecer tu sesión. Por favor, intenta de nuevo.")
          return
        }

        console.log("[v0] Session established successfully")
        setIsReady(true)
      } catch (err) {
        console.error("[v0] Error in code exchange:", err)
        setError("Ocurrió un error al procesar tu enlace de recuperación. Por favor, intenta de nuevo.")
      }
    }

    handleCodeExchange()
  }, [supabase, searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) throw error
      
      setSuccess(true)
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al actualizar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isReady && error) {
    return (
      <AuthShell
        title="Error"
        subtitle="Hubo un problema con tu solicitud"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-5 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <a href="/auth/login">
                <Button className="w-full">
                  Volver a Iniciar sesión
                </Button>
              </a>
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
                Redireccionando a la página de inicio de sesión...
              </p>
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  if (!isReady) {
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

  return (
    <AuthShell
      title="Establecer nueva contraseña"
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
                  placeholder="Mínimo 8 caracteres"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
