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

  console.log("🔍 Auth Callback - Params:", { code: code?.substring(0, 20), type, next })

  // 🔥 IMPORTANTE: Para recovery, NO procesamos el código aquí
  // Dejamos que el cliente lo procese (tiene el code_verifier en cookies)
  if (type === "recovery") {
    console.log("📧 Recovery flow - Redirigiendo a reset-password con código")
    // Redirigimos a reset-password con el código y un flag verified=false
    return NextResponse.redirect(getRedirectUrl(`/auth/reset-password?code=${code || ''}`))
  }

  const supabase = await createClient()

  // Procesar códigos de otros tipos (signup, login)
  if (code) {
    console.log("🔄 Procesando código para tipo:", type)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log("✅ Código procesado exitosamente")
      return NextResponse.redirect(getRedirectUrl(next))
    } else {
      console.error("❌ Error exchanging code:", error.message)
      return NextResponse.redirect(getRedirectUrl("/auth/login?error=auth_error"))
    }
  }

  // Si hay sesión activa, ir al next
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    console.log("✅ Sesión activa encontrada")
    return NextResponse.redirect(getRedirectUrl(next))
  }

  console.log("⚠️ No se encontró sesión ni código válido")
  return NextResponse.redirect(getRedirectUrl("/auth/login?error=auth_error"))
}
