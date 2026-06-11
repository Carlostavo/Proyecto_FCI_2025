"use client"

import { useActionState, useState } from "react"
import { Link2, Mail, Phone, User, FileText, ImageIcon, Bell, BellOff, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { toTitleCase } from "@/lib/format"
import type { Perfil } from "@/lib/perfil"
import {
  actualizarPerfil,
  actualizarNotificaciones,
  type ActualizarPerfilState,
} from "@/lib/perfil-actions"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export function PerfilForm({
  perfil,
  rol,
}: {
  perfil: Perfil | null
  rol: string
}) {
  const [state, formAction, pending] = useActionState<ActualizarPerfilState, FormData>(
    actualizarPerfil,
    null,
  )

  // Vista previa en vivo
  const [nombre, setNombre] = useState(perfil?.nombre_completo ?? "")
  const [avatar, setAvatar] = useState(perfil?.avatar_url ?? "")

  const [notif, setNotif] = useState(perfil?.notificaciones_activas ?? true)
  const [notifMsg, setNotifMsg] = useState<string | null>(null)
  const [notifPending, setNotifPending] = useState(false)

  const nombreMostrado = nombre ? toTitleCase(nombre) : "Sin nombre"

  async function toggleNotif(value: boolean) {
    setNotif(value)
    setNotifPending(true)
    const res = await actualizarNotificaciones(value)
    setNotifPending(false)
    setNotifMsg(res?.message ?? null)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Tarjeta de identidad */}
      <aside className="lg:col-span-1">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24">
              {avatar && <AvatarImage src={avatar || "/placeholder.svg"} alt={nombreMostrado} />}
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {initials(nombreMostrado)}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-semibold text-foreground">{nombreMostrado}</h2>
            <p className="text-sm text-muted-foreground">{rol}</p>
            {perfil?.email && (
              <p className="mt-1 text-xs text-muted-foreground/80">{perfil.email}</p>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {notif ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">Notificaciones</p>
                  <p className="text-xs text-muted-foreground">
                    Sincronizado con el icono de la campana
                  </p>
                </div>
              </div>
              <Switch checked={notif} disabled={notifPending} onCheckedChange={toggleNotif} />
            </div>
            {notifPending && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Guardando…
              </p>
            )}
            {!notifPending && notifMsg && (
              <p className="mt-2 text-xs text-muted-foreground">{notifMsg}</p>
            )}
          </div>
        </div>
      </aside>

      {/* Formulario de datos personales */}
      <form action={formAction} className="lg:col-span-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-base font-semibold text-foreground">Datos personales</h3>
          <p className="mb-5 text-sm text-muted-foreground">
            Información de tu perfil dentro de la plataforma.
          </p>

          <input type="hidden" name="avatar_url" value={avatar} />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Nombre completo" icon={User} className="sm:col-span-2">
              <Input
                name="nombre_completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. María Pérez Quishpe"
              />
            </Field>

            <Field label="Correo electrónico" icon={Mail}>
              <Input
                name="email"
                type="email"
                defaultValue={perfil?.email ?? ""}
                placeholder="correo@ejemplo.com"
              />
            </Field>

            <Field label="Teléfono" icon={Phone}>
              <Input
                name="telefono"
                defaultValue={perfil?.telefono ?? ""}
                placeholder="+593 9 0000 0000"
              />
            </Field>

            <Field label="LinkedIn" icon={Link2} className="sm:col-span-2">
              <Input
                name="linkedin"
                defaultValue={perfil?.linkedin ?? ""}
                placeholder="https://www.linkedin.com/in/usuario"
              />
            </Field>

            <Field label="URL de foto (avatar)" icon={ImageIcon} className="sm:col-span-2">
              <Input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://…/foto.jpg"
              />
            </Field>

            <Field label="Breve descripción" icon={FileText} className="sm:col-span-2">
              <Textarea
                name="breve_descripcion"
                defaultValue={perfil?.breve_descripcion ?? ""}
                rows={4}
                placeholder="Cuéntanos sobre ti…"
              />
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
            <p
              className={cn(
                "text-sm",
                state?.ok ? "text-primary" : "text-destructive",
                !state && "text-transparent",
              )}
            >
              {state?.message ?? "."}
            </p>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  icon: Icon,
  className,
  children,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1.5 text-sm text-foreground">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  )
}
