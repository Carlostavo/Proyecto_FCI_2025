import type { ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { getPerfilContext, getNotificacionesDemo } from "@/lib/perfil"

export async function AppShell({ children }: { children: ReactNode }) {
  const ctx = await getPerfilContext()
  const notificaciones = getNotificacionesDemo()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          nombre={ctx.nombre}
          rol={ctx.rol}
          avatarUrl={ctx.avatarUrl}
          notificacionesActivas={ctx.notificacionesActivas}
          notificaciones={notificaciones}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
          <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
            © 2026 Universidad de Guayaquil · Plataforma de Gestión de Proyectos FCI
          </footer>
        </main>
      </div>
    </div>
  )
}
