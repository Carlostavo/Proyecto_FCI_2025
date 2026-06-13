import type { ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { HeaderSync } from "@/components/dashboard/header-sync"
import { getPerfilContext, getNotificacionesDemo } from "@/lib/perfil"

export async function AppShell({ children }: { children: ReactNode }) {
  const ctx = await getPerfilContext()
  const notificaciones = getNotificacionesDemo()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderSync
          initialNombre={ctx.nombre}
          initialRol={ctx.rol}
          initialAvatarUrl={ctx.avatarUrl}
          initialNotificacionesActivas={ctx.notificacionesActivas}
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
