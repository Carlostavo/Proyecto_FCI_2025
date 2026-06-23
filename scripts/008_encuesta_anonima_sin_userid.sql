-- =============================================================================
-- Encuesta Diagnóstica Anónima - SIN user_id (para participantes sin cuenta auth)
-- Contiene las 23 preguntas en 5 bloques
-- =============================================================================

-- Crear tabla de bloques si no existe
CREATE TABLE IF NOT EXISTS public.encuesta_bloques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Crear tabla de preguntas dinámicas
CREATE TABLE IF NOT EXISTS public.encuesta_preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_bloque UUID NOT NULL REFERENCES public.encuesta_bloques(id) ON DELETE CASCADE,
  numero_pregunta INT NOT NULL,
  pregunta TEXT NOT NULL,
  tipo_respuesta TEXT NOT NULL CHECK (tipo_respuesta IN ('texto', 'opcion_multiple', 'checkbox', 'escala', 'numerica')),
  opciones JSONB,
  ayuda TEXT,
  requerida BOOLEAN NOT NULL DEFAULT TRUE,
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  condicion_visible_json JSONB,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id_bloque, numero_pregunta)
);

-- Crear tabla para respuestas ANÓNIMAS (sin user_id de auth)
CREATE TABLE IF NOT EXISTS public.encuesta_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_sesion TEXT NOT NULL, -- ID de sesión anónima (generado en el cliente)
  id_pregunta UUID NOT NULL REFERENCES public.encuesta_preguntas(id) ON DELETE CASCADE,
  respuesta TEXT,
  respuesta_array TEXT[],
  fecha_respuesta TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id_sesion, id_pregunta)
);

-- Crear tabla para rastrear participantes anónimos
CREATE TABLE IF NOT EXISTS public.encuesta_sesiones (
  id TEXT PRIMARY KEY,
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_ultima_actividad TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado TEXT DEFAULT 'activa',
  porcentaje_completado INT DEFAULT 0
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_encuesta_respuestas_sesion ON public.encuesta_respuestas(id_sesion);
CREATE INDEX IF NOT EXISTS idx_encuesta_respuestas_pregunta ON public.encuesta_respuestas(id_pregunta);
CREATE INDEX IF NOT EXISTS idx_encuesta_preguntas_bloque ON public.encuesta_preguntas(id_bloque);
CREATE INDEX IF NOT EXISTS idx_encuesta_bloques_orden ON public.encuesta_bloques(orden);

-- =============================================================================
-- INSERTAR BLOQUES
-- =============================================================================

INSERT INTO public.encuesta_bloques (nombre, descripcion, orden, activo)
VALUES
  ('Información Base', 'Información sobre la emprendedora y su negocio', 1, TRUE),
  ('Gestión y Finanzas', 'Aspectos de gestión financiera y control', 2, TRUE),
  ('Marketing y Tecnología', 'Promoción y herramientas digitales utilizadas', 3, TRUE),
  ('Cultura e Identidad', 'Elementos culturales e identidad de la empresa', 4, TRUE),
  ('Participación en Programa', 'Interés y modalidad de participación', 5, TRUE)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INSERTAR PREGUNTAS - BLOQUE 1: INFORMACIÓN BASE
-- =============================================================================

WITH bloque_info AS (
  SELECT id FROM public.encuesta_bloques WHERE nombre = 'Información Base' LIMIT 1
)
INSERT INTO public.encuesta_preguntas (id_bloque, numero_pregunta, pregunta, tipo_respuesta, opciones, ayuda, requerida, orden, activo)
SELECT 
  bloque_info.id,
  datos.numero,
  datos.pregunta,
  datos.tipo,
  datos.opciones,
  datos.ayuda,
  TRUE,
  datos.numero,
  TRUE
FROM bloque_info,
  (VALUES
    (1, '¿En cuál parroquia de Guayaquil se ubica tu negocio?', 'opcion_multiple', 
     '{"opciones": ["Parroquia 1", "Parroquia 2", "Parroquia 3", "Parroquia 4", "Otra"]}', 'Selecciona tu parroquia'),
    (2, '¿Cuál es el sector principal de tu negocio?', 'opcion_multiple',
     '{"opciones": ["Servicios", "Comercio", "Manufactura", "Agricultura", "Tecnología", "Otro"]}', 'Categoría principal'),
    (3, '¿Cuántos años lleva tu negocio activo?', 'numerica',
     '{"min": 0, "max": 100}', 'Años de operación'),
    (4, '¿De dónde proviene la economía del hogar?', 'opcion_multiple',
     '{"opciones": ["Solo del negocio", "Negocio + otros ingresos", "Solo otras fuentes", "Herencia/Ahorro"]}', 'Fuente de ingresos'),
    (5, '¿Cuál es el rango de ingresos mensuales aproximados?', 'opcion_multiple',
     '{"opciones": ["$0 - $500", "$500 - $1,000", "$1,000 - $2,000", "$2,000 - $5,000", "Más de $5,000"]}', 'Rango de ingresos'),
    (6, '¿Cuál es tu nivel de educación?', 'opcion_multiple',
     '{"opciones": ["Primaria", "Secundaria", "Técnico", "Superior", "Posgrado"]}', 'Máximo nivel alcanzado'),
    (7, '¿Con cuál grupo cultural te autoidentificas?', 'opcion_multiple',
     '{"opciones": ["Mestiza", "Indígena", "Afrodescendiente", "Blanca", "Otra"]}', 'Identidad cultural')
  ) AS datos(numero, pregunta, tipo, opciones, ayuda)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INSERTAR PREGUNTAS - BLOQUE 2: GESTIÓN Y FINANZAS
-- =============================================================================

WITH bloque_gestion AS (
  SELECT id FROM public.encuesta_bloques WHERE nombre = 'Gestión y Finanzas' LIMIT 1
)
INSERT INTO public.encuesta_preguntas (id_bloque, numero_pregunta, pregunta, tipo_respuesta, opciones, ayuda, requerida, orden, activo)
SELECT 
  bloque_gestion.id,
  datos.numero,
  datos.pregunta,
  datos.tipo,
  datos.opciones,
  datos.ayuda,
  TRUE,
  datos.numero - 7,
  TRUE
FROM bloque_gestion,
  (VALUES
    (8, '¿Tu negocio está formalizado ante las autoridades?', 'opcion_multiple',
     '{"opciones": ["Sí, completamente", "Parcialmente", "No", "En proceso"]}', 'Estado de formalización'),
    (9, '¿Llevas control de dinero en tu negocio?', 'opcion_multiple',
     '{"opciones": ["Sí, detailed", "Sí, básico", "No, en la cabeza", "No lo hago"]}', 'Nivel de control'),
    (10, '¿Tienes metas financieras claras para este año?', 'opcion_multiple',
     '{"opciones": ["Sí, muy claras", "Sí, aproximadas", "No, pero quisiera", "No"]}', 'Claridad de metas'),
    (11, '¿Cuál es tu ganancia promedio mensual neto?', 'opcion_multiple',
     '{"opciones": ["Pérdida", "$1 - $200", "$200 - $500", "$500 - $1,000", "Más de $1,000", "No sé"]}', 'Rentabilidad'),
    (12, '¿Cómo estableces los precios de tus productos/servicios?', 'opcion_multiple',
     '{"opciones": ["Costo + % ganancia", "Según competencia", "Según demanda", "Al azar", "Otro"]}', 'Estrategia de precios')
  ) AS datos(numero, pregunta, tipo, opciones, ayuda)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INSERTAR PREGUNTAS - BLOQUE 3: MARKETING Y TECNOLOGÍA
-- =============================================================================

WITH bloque_marketing AS (
  SELECT id FROM public.encuesta_bloques WHERE nombre = 'Marketing y Tecnología' LIMIT 1
)
INSERT INTO public.encuesta_preguntas (id_bloque, numero_pregunta, pregunta, tipo_respuesta, opciones, ayuda, requerida, orden, activo)
SELECT 
  bloque_marketing.id,
  datos.numero,
  datos.pregunta,
  datos.tipo,
  datos.opciones,
  datos.ayuda,
  TRUE,
  datos.numero - 12,
  TRUE
FROM bloque_marketing,
  (VALUES
    (13, '¿Cómo promocionas tu negocio?', 'checkbox',
     '{"opciones": ["Boca a boca", "Redes sociales", "Publicidad pagada", "Página web", "Ninguno"]}', 'Selecciona todos'),
    (14, '¿Qué tan importante son las opiniones/reseñas de clientes?', 'escala',
     '{"min": 1, "max": 5, "labels": ["Nada importante", "Muy importante"]}', 'Escala de importancia'),
    (15, '¿Qué dispositivos usas para tu negocio?', 'checkbox',
     '{"opciones": ["Teléfono móvil", "Computadora", "Tablet", "Ninguno"]}', 'Selecciona todos'),
    (16, '¿Usas aplicaciones para gestionar tu negocio?', 'opcion_multiple',
     '{"opciones": ["Sí, varias", "Sí, una o dos", "No, pero quisiera", "No"]}', 'Uso de aplicaciones'),
    (17, '¿Aceptas pagos digitales?', 'opcion_multiple',
     '{"opciones": ["Sí, múltiples formas", "Sí, algunas formas", "No, solo efectivo", "Quisiera pero no sé cómo"]}', 'Métodos de pago'),
    (18, '¿Tienes presencia en redes sociales?', 'opcion_multiple',
     '{"opciones": ["Sí, activa", "Sí, poco activa", "Tengo pero no la uso", "No"]}', 'Uso de redes')
  ) AS datos(numero, pregunta, tipo, opciones, ayuda)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INSERTAR PREGUNTAS - BLOQUE 4: CULTURA E IDENTIDAD
-- =============================================================================

WITH bloque_cultura AS (
  SELECT id FROM public.encuesta_bloques WHERE nombre = 'Cultura e Identidad' LIMIT 1
)
INSERT INTO public.encuesta_preguntas (id_bloque, numero_pregunta, pregunta, tipo_respuesta, opciones, ayuda, requerida, orden, activo)
SELECT 
  bloque_cultura.id,
  datos.numero,
  datos.pregunta,
  datos.tipo,
  datos.opciones,
  datos.ayuda,
  TRUE,
  datos.numero - 18,
  TRUE
FROM bloque_cultura,
  (VALUES
    (19, '¿Tu negocio incorpora elementos culturales en su identidad?', 'opcion_multiple',
     '{"opciones": ["Sí, directamente", "Sí, indirectamente", "No, pero quisiera", "No"]}', 'Identidad cultural del negocio'),
    (20, '¿De dónde es el origen de tu producto/servicio?', 'opcion_multiple',
     '{"opciones": ["Tradición local", "Innovación personal", "Inspiración extranjera", "Combinación"]}', 'Origen'),
    (21, '¿Participas en grupos comunitarios o asociaciones?', 'opcion_multiple',
     '{"opciones": ["Sí, activamente", "Sí, ocasionalmente", "No, pero me gustaría", "No"]}', 'Participación comunitaria')
  ) AS datos(numero, pregunta, tipo, opciones, ayuda)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INSERTAR PREGUNTAS - BLOQUE 5: PARTICIPACIÓN EN PROGRAMA
-- =============================================================================

WITH bloque_participacion AS (
  SELECT id FROM public.encuesta_bloques WHERE nombre = 'Participación en Programa' LIMIT 1
)
INSERT INTO public.encuesta_preguntas (id_bloque, numero_pregunta, pregunta, tipo_respuesta, opciones, ayuda, requerida, orden, activo)
SELECT 
  bloque_participacion.id,
  datos.numero,
  datos.pregunta,
  datos.tipo,
  datos.opciones,
  datos.ayuda,
  TRUE,
  datos.numero - 21,
  TRUE
FROM bloque_participacion,
  (VALUES
    (22, '¿Desearías participar en nuestro programa de formación?', 'opcion_multiple',
     '{"opciones": ["Sí, totalmente", "Sí, parcialmente", "Tal vez", "No"]}', 'Interés de participación'),
    (23, '¿Cuál sería tu forma preferida de participación?', 'opcion_multiple',
     '{"opciones": ["Presencial", "Virtual", "Mixta", "No disponible"]}', 'Modalidad de participación')
  ) AS datos(numero, pregunta, tipo, opciones, ayuda)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- GRANT DE PERMISOS (si estás usando RLS)
-- =============================================================================

ALTER TABLE public.encuesta_bloques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_sesiones ENABLE ROW LEVEL SECURITY;

-- Las políticas permiten lectura pública de preguntas y bloques (para llenar la encuesta)
-- y escritura solo en respuestas y sesiones
CREATE POLICY "Leer bloques y preguntas" ON public.encuesta_bloques
  FOR SELECT USING (TRUE);

CREATE POLICY "Leer bloques y preguntas" ON public.encuesta_preguntas
  FOR SELECT USING (TRUE);

CREATE POLICY "Insertar y actualizar respuestas" ON public.encuesta_respuestas
  FOR INSERT WITH CHECK (TRUE)
  FOR UPDATE USING (TRUE);

CREATE POLICY "Insertar y actualizar sesiones" ON public.encuesta_sesiones
  FOR INSERT WITH CHECK (TRUE)
  FOR UPDATE USING (TRUE);
