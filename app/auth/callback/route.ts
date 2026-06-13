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

  // 🔥 IMPORTANTE: Para recovery, NO procesamos el código aquí
  // Dejamos que el cliente lo procese (tiene el code_verifier en cookies)
  if (type === "recovery") {
    // Simplemente redirigimos a reset-password con el código
    return NextResponse.redirect(getRedirectUrl(`/auth/reset-password?code=${code || ''}`))
  }

  const supabase = await createClient()

  // Procesar códigos de otros tipos (signup, login)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(getRedirectUrl(next))
    } else {
      console.error("[Auth Callback] Error exchanging code:", error.message)
      return NextResponse.redirect(getRedirectUrl("/auth/login?error=auth_error"))
    }
  }

  // Si hay sesión activa, ir al next
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    return NextResponse.redirect(getRedirectUrl(next))
  }

  return NextResponse.redirect(getRedirectUrl("/auth/login?error=auth_error"))
}
