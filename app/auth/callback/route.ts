import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const type = searchParams.get("type")

  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"

  const getRedirectUrl = (path: string) => {
    if (isLocalEnv) {
      return `${origin}${path}`
    } else if (forwardedHost) {
      return `https://${forwardedHost}${path}`
    } else {
      return `${origin}${path}`
    }
  }

  const supabase = await createClient()

  // Si viene un código (flujo de sign-up o login tradicional)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Si es un recovery (reset password), redirigir a la página de cambio de contraseña
      if (type === "recovery") {
        return NextResponse.redirect(getRedirectUrl("/auth/reset-password?verified=true"))
      }
      return NextResponse.redirect(getRedirectUrl(next))
    } else {
      console.error("[v0] Auth Callback - Error exchanging code:", error.message)
      return NextResponse.redirect(getRedirectUrl("/auth/login?error=auth_error"))
    }
  }

  // Si NO viene código pero SÍ viene type=recovery, significa que Supabase ya estableció la sesión
  // (esto ocurre cuando Supabase redirige desde /verify después de verificar el email)
  if (type === "recovery") {
    // Verificar que la sesión existe
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      return NextResponse.redirect(getRedirectUrl("/auth/reset-password?verified=true"))
    }
    return NextResponse.redirect(getRedirectUrl("/auth/login?error=auth_error"))
  }

  // Si hay una sesión activa, ir al next, si no, al login
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    return NextResponse.redirect(getRedirectUrl(next))
  }

  return NextResponse.redirect(getRedirectUrl("/auth/login?error=auth_error"))
}
