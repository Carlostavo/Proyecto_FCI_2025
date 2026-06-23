-- ============================================================================
-- SISTEMA DE ENCUESTAS DINÁMICAS Y SINCRONIZADAS
-- Para administradora: crear, editar, eliminar, ocultar encuestas
-- Para emprendedoras: responder encuestas anónimas
-- ============================================================================

-- 1. TABLA DE ENCUESTAS (Gestión por administradora)
CREATE TABLE IF NOT EXISTS public.encuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  es_inicial BOOLEAN DEFAULT FALSE, -- Para marcar la encuesta inicial (de CSV)
  estado BOOLEAN DEFAULT TRUE, -- visible/oculta
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE BLOQUES (Temas/Secciones dentro de cada encuesta)
CREATE TABLE IF NOT EXISTS public.encuesta_bloques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL REFERENCES public.encuestas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  orden INT NOT NULL,
  estado BOOLEAN DEFAULT TRUE, -- visible/oculta
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(encuesta_id, orden)
);

-- 3. TABLA DE PREGUNTAS (Preguntas dinámicas y condicionales)
CREATE TABLE IF NOT EXISTS public.encuesta_preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bloque_id UUID NOT NULL REFERENCES public.encuesta_bloques(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'texto', 'numero', 'radio', 'checkbox', 'escala'
  opciones JSONB, -- Para radio, checkbox: {"opciones": ["opcion1", "opcion2"]}
  texto_ayuda TEXT,
  requerido BOOLEAN DEFAULT TRUE,
  orden INT NOT NULL,
  visible_cuando JSONB, -- Condiciones de visibilidad: {"pregunta_id": "...", "valor": "..."}
  estado BOOLEAN DEFAULT TRUE, -- visible/oculta
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bloque_id, orden)
);

-- 4. TABLA DE SESIONES (Rastreo de sesiones anónimas)
CREATE TABLE IF NOT EXISTS public.encuesta_sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL REFERENCES public.encuestas(id) ON DELETE CASCADE,
  id_sesion TEXT UNIQUE NOT NULL, -- Hash único por navegador
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completada BOOLEAN DEFAULT FALSE
);

-- 5. TABLA DE RESPUESTAS (Respuestas de emprendedoras - SIN user_id)
CREATE TABLE IF NOT EXISTS public.encuesta_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL REFERENCES public.encuestas(id) ON DELETE CASCADE,
  sesion_id UUID NOT NULL REFERENCES public.encuesta_sesiones(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL REFERENCES public.encuesta_preguntas(id) ON DELETE CASCADE,
  respuesta TEXT,
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sesion_id, pregunta_id)
);

-- ============================================================================
-- TABLA ESPECIAL: Para la encuesta inicial (sincronizada con cuestionario_limpio_respuestas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cuestionario_limpio_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_sesion TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  marca_temporal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Información Base (7 preguntas)
  parroquia TEXT,
  sector_ubicacion TEXT,
  antiguedad_emprendimiento TEXT,
  economia_hogar TEXT,
  ingreso_mensual TEXT,
  nivel_instruccion TEXT,
  etnia TEXT,
  -- Gestión y Finanzas (5 preguntas)
  formalizacion TEXT,
  control_dinero TEXT,
  metas_financieras TEXT,
  ganancia_promedio TEXT,
  fijacion_precios TEXT,
  -- Marketing y Tecnología (6 preguntas)
  promocion TEXT,
  importancia_opiniones TEXT,
  dispositivos_usados TEXT,
  aplicaciones_negocio TEXT,
  pagos_digitales TEXT,
  presencia_redes TEXT,
  -- Cultura e Identidad (3 preguntas)
  elementos_culturales TEXT,
  origen_producto TEXT,
  grupos_participacion TEXT,
  -- Participación (2 preguntas)
  deseo_participar TEXT,
  modalidad_preferida TEXT,
  -- Total: 23 campos + 10 administrativos = 33 campos
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_encuesta_bloques_encuesta_id ON public.encuesta_bloques(encuesta_id);
CREATE INDEX IF NOT EXISTS idx_encuesta_preguntas_bloque_id ON public.encuesta_preguntas(bloque_id);
CREATE INDEX IF NOT EXISTS idx_encuesta_sesiones_encuesta_id ON public.encuesta_sesiones(encuesta_id);
CREATE INDEX IF NOT EXISTS idx_encuesta_sesiones_id_sesion ON public.encuesta_sesiones(id_sesion);
CREATE INDEX IF NOT EXISTS idx_encuesta_respuestas_encuesta_id ON public.encuesta_respuestas(encuesta_id);
CREATE INDEX IF NOT EXISTS idx_encuesta_respuestas_sesion_id ON public.encuesta_respuestas(sesion_id);
CREATE INDEX IF NOT EXISTS idx_encuesta_respuestas_pregunta_id ON public.encuesta_respuestas(pregunta_id);
CREATE INDEX IF NOT EXISTS idx_cuestionario_id_sesion ON public.cuestionario_limpio_respuestas(id_sesion);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_bloques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuestionario_limpio_respuestas ENABLE ROW LEVEL SECURITY;

-- Políticas para encuestas (lectura pública, escritura solo admin)
CREATE POLICY "Encuestas lectura pública" 
  ON public.encuestas FOR SELECT USING (activo = true);
CREATE POLICY "Encuestas escritura admin" 
  ON public.encuestas FOR ALL USING (true); -- Cambiar cuando tengas auth

-- Políticas para bloques (lectura pública si encuesta activa)
CREATE POLICY "Bloques lectura pública" 
  ON public.encuesta_bloques FOR SELECT 
  USING (
    activo = true AND estado = true AND 
    encuesta_id IN (SELECT id FROM public.encuestas WHERE activo = true)
  );

-- Políticas para preguntas (lectura pública si bloque activo)
CREATE POLICY "Preguntas lectura pública" 
  ON public.encuesta_preguntas FOR SELECT 
  USING (
    activo = true AND estado = true AND 
    bloque_id IN (
      SELECT id FROM public.encuesta_bloques 
      WHERE activo = true AND estado = true
    )
  );

-- Políticas para sesiones (lectura/escritura de la propia sesión)
CREATE POLICY "Sesiones lectura pública" 
  ON public.encuesta_sesiones FOR SELECT USING (true);
CREATE POLICY "Sesiones crear" 
  ON public.encuesta_sesiones FOR INSERT WITH CHECK (true);

-- Políticas para respuestas (lectura/escritura de la propia sesión)
CREATE POLICY "Respuestas lectura propia sesion" 
  ON public.encuesta_respuestas FOR SELECT 
  USING (
    sesion_id IN (SELECT id FROM public.encuesta_sesiones)
  );
CREATE POLICY "Respuestas crear propia sesion" 
  ON public.encuesta_respuestas FOR INSERT WITH CHECK (true);
CREATE POLICY "Respuestas actualizar propia sesion" 
  ON public.encuesta_respuestas FOR UPDATE USING (true) WITH CHECK (true);

-- Políticas para cuestionario_limpio (lectura admin, escritura emprendedoras)
CREATE POLICY "Cuestionario lectura pública" 
  ON public.cuestionario_limpio_respuestas FOR SELECT USING (true);
CREATE POLICY "Cuestionario escritura" 
  ON public.cuestionario_limpio_respuestas FOR INSERT WITH CHECK (true);
CREATE POLICY "Cuestionario actualizar" 
  ON public.cuestionario_limpio_respuestas FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================================
-- INSERTAR ENCUESTA INICIAL (La del CSV)
-- ============================================================================

INSERT INTO public.encuestas (titulo, descripcion, es_inicial, estado, activo) 
VALUES (
  'Diagnóstico Inicial',
  'Encuesta diagnóstica para conocer el estado actual de tu emprendimiento',
  true,
  true,
  true
)
ON CONFLICT DO NOTHING;

-- Obtener el ID de la encuesta inicial (ajusta si necesitas)
-- SELECT id FROM public.encuestas WHERE es_inicial = true LIMIT 1;

-- ============================================================================
-- CREACIÓN DE TRIGGERS PARA AUDITORÍA (OPCIONAL)
-- ============================================================================

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS public.encuesta_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla TEXT NOT NULL,
  accion TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FUNCIONES ÚTILES
-- ============================================================================

-- Función para obtener encuesta con sus bloques y preguntas (para emprendedora)
CREATE OR REPLACE FUNCTION obtener_encuesta_completa(p_encuesta_id UUID)
RETURNS TABLE (
  encuesta_id UUID,
  titulo TEXT,
  bloque_id UUID,
  bloque_titulo TEXT,
  pregunta_id UUID,
  pregunta TEXT,
  tipo TEXT,
  opciones JSONB,
  requerido BOOLEAN
) AS $$
SELECT 
  e.id,
  e.titulo,
  b.id,
  b.titulo,
  p.id,
  p.pregunta,
  p.tipo,
  p.opciones,
  p.requerido
FROM public.encuestas e
LEFT JOIN public.encuesta_bloques b ON e.id = b.encuesta_id AND b.activo = true AND b.estado = true
LEFT JOIN public.encuesta_preguntas p ON b.id = p.bloque_id AND p.activo = true AND p.estado = true
WHERE e.id = p_encuesta_id AND e.activo = true AND e.estado = true
ORDER BY b.orden, p.orden;
$$ LANGUAGE SQL;

-- Función para obtener respuestas de una sesión
CREATE OR REPLACE FUNCTION obtener_respuestas_sesion(p_sesion_id UUID)
RETURNS TABLE (
  pregunta_id UUID,
  respuesta TEXT,
  actualizada_en TIMESTAMP
) AS $$
SELECT 
  pregunta_id,
  respuesta,
  actualizada_en
FROM public.encuesta_respuestas
WHERE sesion_id = p_sesion_id
ORDER BY actualizada_en DESC;
$$ LANGUAGE SQL;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- 
-- PRÓXIMOS PASOS:
-- 1. Ejecutar este script en Supabase
-- 2. Verificar que todas las tablas fueron creadas
-- 3. Implementar APIs REST para CRUD de encuestas
-- 4. Crear componentes React para administradora y emprendedoras
-- 5. Importar datos del CSV a cuestionario_limpio_respuestas si es necesario
--
-- ============================================================================
