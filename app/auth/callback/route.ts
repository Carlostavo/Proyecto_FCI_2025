// /app/auth/callback/route.ts
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

  console.log("🔍 Callback - Type:", type, "Code:", code?.substring(0, 20))

  // 🔑 Para recovery, el servidor debe intercambiar el código
  // porque tiene acceso a las cookies con el code_verifier
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log("✅ Código intercambiado exitosamente en el servidor")
      
      // Si es recovery, redirigir a reset-password
      if (type === "recovery") {
        return NextResponse.redirect(getRedirectUrl("/auth/reset-password?verified=true"))
      }
      
      return NextResponse.redirect(getRedirectUrl(next))
    } else {
      console.error("❌ Error exchanging code:", error.message)
      return NextResponse.redirect(getRedirectUrl(`/auth/login?error=auth_error&message=${encodeURIComponent(error.message)}`))
    }
  }

  // Si no hay código, verificar sesión existente
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    return NextResponse.redirect(getRedirectUrl(next))
  }

  return NextResponse.redirect(getRedirectUrl("/auth/login?error=no_code"))
}
