import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { sesionId, respuestas, timestamp } = await request.json()

    if (!sesionId || !respuestas) {
      return Response.json(
        { error: "Datos incompletos" },
        { status: 400 }
      )
    }

    // Mapear respuestas al esquema de la tabla cuestionario_limpio_respuestas
    const fila: Record<string, any> = {
      marca_temporal: timestamp,
      ubicacion: respuestas.parroquia || null,
      parroquia: respuestas.parroquia || null,
      sector_ubicacion: respuestas.sector_ubicacion || null,
      antiguedad_emprendimiento: respuestas.antiguedad_emprendimiento || null,
      sector_economico: respuestas.sector_economico || null,
      ingreso_mensual: respuestas.ingreso_mensual || null,
      nivel_instruccion: respuestas.nivel_instruccion || null,
      etnia: respuestas.etnia || null,
      situacion_formalizacion: respuestas.situacion_formalizacion || null,
      control_dinero: respuestas.control_dinero || null,
      planifica_metas: respuestas.planifica_metas || null,
      reinvierte_ganancias: respuestas.reinvierte_ganancias || null,
      define_precios_costos: respuestas.define_precios_costos || null,
      promocion_negocio: respuestas.promocion_negocio || null,
      medios_promocion: Array.isArray(respuestas.medios_promocion)
        ? respuestas.medios_promocion.join(", ")
        : respuestas.medios_promocion || null,
      usa_sugerencias_clientes: respuestas.usa_sugerencias_clientes || null,
      dispositivo_internet: respuestas.dispositivo_internet || null,
      dispositivos_usados: Array.isArray(respuestas.dispositivos_usados)
        ? respuestas.dispositivos_usados.join(", ")
        : respuestas.dispositivos_usados || null,
      usa_apps_digitales: respuestas.usa_apps_digitales || null,
      apps_usadas: Array.isArray(respuestas.apps_usadas)
        ? respuestas.apps_usadas.join(", ")
        : respuestas.apps_usadas || null,
      usa_pagos_digitales: respuestas.usa_pagos_digitales || null,
      pagos_usados: Array.isArray(respuestas.pagos_usados)
        ? respuestas.pagos_usados.join(", ")
        : respuestas.pagos_usados || null,
      dificultad_tecnologia: respuestas.dificultad_tecnologia || null,
      incorpora_cultura: respuestas.incorpora_cultura || null,
      elementos_culturales: Array.isArray(respuestas.elementos_culturales)
        ? respuestas.elementos_culturales.join(", ")
        : respuestas.elementos_culturales || null,
      origen_conocimiento_cultural: respuestas.origen_conocimiento_cultural || null,
      participa_asociaciones: respuestas.participa_asociaciones || null,
      asociaciones: Array.isArray(respuestas.asociaciones)
        ? respuestas.asociaciones.join(", ")
        : respuestas.asociaciones || null,
      interes_programa: respuestas.interes_programa || null,
      contacto_programa: respuestas.contacto_programa || null,
      modalidad_preferida: respuestas.modalidad_preferida || null,
    }

    const { error } = await supabase
      .from("cuestionario_limpio_respuestas")
      .insert([fila])

    if (error) {
      console.error("Error guardando borrador:", error)
      return Response.json(
        { error: "Error guardando borrador" },
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("Error en save-draft:", err)
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
