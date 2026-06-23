-- =============================================================================
-- Script para encuesta dinámica sin user_id (solo datos CSV)
-- Permite a administradoras crear, editar, ocultar preguntas y sus condiciones
-- =============================================================================

-- Tabla de bloques de encuesta
CREATE TABLE IF NOT EXISTS public.encuesta_bloques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de preguntas dinámicas
CREATE TABLE IF NOT EXISTS public.encuesta_preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_bloque UUID NOT NULL REFERENCES public.encuesta_bloques(id) ON DELETE CASCADE,
  numero_pregunta INT NOT NULL,
  pregunta TEXT NOT NULL,
  tipo_respuesta TEXT NOT NULL CHECK (tipo_respuesta IN ('texto', 'opcion_multiple', 'checkbox', 'escala')),
  opciones JSONB, -- Para múltiple opción y checkbox: {"opciones": ["opcion1", "opcion2"]}
  ayuda TEXT,
  requerida BOOLEAN NOT NULL DEFAULT TRUE,
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  condicion_visible_json JSONB, -- {"pregunta_id": "...", "valor": "..."} para visibilidad condicional
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id_bloque, numero_pregunta)
);

-- Tabla para guardar respuestas de CSV
CREATE TABLE IF NOT EXISTS public.encuesta_respuestas_csv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_participante TEXT NOT NULL, -- ID del CSV (no es UUID de auth)
  id_pregunta UUID NOT NULL REFERENCES public.encuesta_preguntas(id) ON DELETE CASCADE,
  respuesta TEXT,
  respuesta_array TEXT[], -- Para checkbox
  fecha_respuesta TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id_participante, id_pregunta)
);

-- Tabla resumen de encuestas por participante
CREATE TABLE IF NOT EXISTS public.encuesta_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_participante TEXT NOT NULL UNIQUE,
  nombre TEXT,
  email TEXT,
  telefono TEXT,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'validada', 'anulada')),
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_envio TIMESTAMPTZ,
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de historial de cambios en preguntas (auditoría)
CREATE TABLE IF NOT EXISTS public.encuesta_preguntas_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pregunta UUID NOT NULL REFERENCES public.encuesta_preguntas(id) ON DELETE SET NULL,
  accion TEXT NOT NULL CHECK (accion IN ('crear', 'editar', 'eliminar', 'ocultar', 'mostrar')),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  realizado_por TEXT, -- Email o ID de la administradora
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_encuesta_preguntas_bloque ON public.encuesta_preguntas(id_bloque);
CREATE INDEX idx_encuesta_preguntas_activo ON public.encuesta_preguntas(activo);
CREATE INDEX idx_encuesta_respuestas_csv_participante ON public.encuesta_respuestas_csv(id_participante);
CREATE INDEX idx_encuesta_respuestas_csv_pregunta ON public.encuesta_respuestas_csv(id_pregunta);
CREATE INDEX idx_encuesta_participantes_estado ON public.encuesta_participantes(estado);

-- Insertar bloques iniciales
INSERT INTO public.encuesta_bloques (nombre, descripcion, orden)
VALUES
  ('Información Base', 'Datos sobre la emprendedora y el negocio', 1),
  ('Gestión y Finanzas', 'Aspectos de gestión empresarial y financiera', 2),
  ('Marketing y Tecnología', 'Estrategias de mercado y adopción tecnológica', 3),
  ('Cultura e Identidad', 'Elementos culturales y participación comunitaria', 4),
  ('Participación en Programa', 'Interés y disponibilidad de participación', 5)
ON CONFLICT DO NOTHING;

-- Insertar preguntas iniciales del bloque 1: Información Base
INSERT INTO public.encuesta_preguntas (
  id_bloque, numero_pregunta, pregunta, tipo_respuesta, opciones, ayuda, requerida, orden
)
SELECT
  id,
  1,
  '¿En qué parroquia está ubicado tu negocio?',
  'opcion_multiple',
  '{"opciones": ["Parroquia 1", "Parroquia 2", "Parroquia 3"]}'::jsonb,
  'Selecciona la parroquia donde opera tu negocio',
  true,
  1
FROM public.encuesta_bloques
WHERE nombre = 'Información Base'
ON CONFLICT (id_bloque, numero_pregunta) DO NOTHING;

INSERT INTO public.encuesta_preguntas (
  id_bloque, numero_pregunta, pregunta, tipo_respuesta, ayuda, requerida, orden
)
SELECT
  id,
  2,
  '¿En qué sector económico trabaja tu negocio?',
  'texto',
  'Describe el sector principal (comercio, servicios, manufactura, etc.)',
  true,
  2
FROM public.encuesta_bloques
WHERE nombre = 'Información Base'
ON CONFLICT (id_bloque, numero_pregunta) DO NOTHING;

-- Row Level Security (RLS) para tabla de participantes
ALTER TABLE public.encuesta_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_respuestas_csv ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Administradora puede ver todo
CREATE POLICY "Administradoras ven todas las encuestas"
  ON public.encuesta_participantes
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Administradoras ven todas las preguntas"
  ON public.encuesta_preguntas
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Administradoras ven todas las respuestas"
  ON public.encuesta_respuestas_csv
  FOR SELECT
  USING (TRUE);

-- Permisos de inserción y actualización solo para administradoras
CREATE POLICY "Solo administradoras crean/editan preguntas"
  ON public.encuesta_preguntas
  FOR ALL
  USING (TRUE);

-- Función para registrar cambios
CREATE OR REPLACE FUNCTION public.registrar_cambio_pregunta()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.encuesta_preguntas_auditoria (
    id_pregunta, accion, datos_anteriores, datos_nuevos, realizado_por
  ) VALUES (
    NEW.id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'crear'
      WHEN TG_OP = 'UPDATE' THEN 'editar'
      WHEN TG_OP = 'DELETE' THEN 'eliminar'
    END,
    to_jsonb(OLD),
    to_jsonb(NEW),
    current_user
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_preguntas
AFTER INSERT OR UPDATE OR DELETE ON public.encuesta_preguntas
FOR EACH ROW
EXECUTE FUNCTION public.registrar_cambio_pregunta();
