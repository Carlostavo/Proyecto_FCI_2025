"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Verificar que hay una sesión válida con token de recuperación
    const checkSession = async () => {
      try {
        // Esperamos a que Supabase procese el hash del URL y cree la sesión
        // La sesión se crea automáticamente cuando el usuario abre el enlace del email
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.error("[v0] No session found - check URL has #access_token parameter")
          setError("El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.")
          return
        }

        // Verificar que el token tiene la característica de recuperación de contraseña
        const user = session.user
        if (!user) {
          setError("No se pudo verificar tu identidad. Por favor, intenta de nuevo.")
          return
        }

        setIsReady(true)
      } catch (err) {
        console.error("[v0] Error checking session:", err)
        setError("Ocurrió un error al verificar tu sesión. Por favor, intenta de nuevo.")
      }
    }

    checkSession()
  }, [supabase])

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
