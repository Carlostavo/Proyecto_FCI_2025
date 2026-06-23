-- ═════════════════════════════════════════════════════════════════════════════
-- GUÍA: IMPORTAR DATOS DESDE CSV A LA ENCUESTA DINÁMICA
-- ═════════════════════════════════════════════════════════════════════════════
-- 
-- Ejecuta estos queries en Supabase SQL Editor para poblar la BD con datos CSV
-- ═════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. IMPORTAR PARTICIPANTES (desde CSV)
-- ─────────────────────────────────────────────────────────────────────────────
-- 
-- Tu CSV debe tener columnas:
-- id_participante | nombre | email | telefono
-- 
-- Ejemplo:
-- PART_001,Maria García,maria@email.com,0987654321
-- PART_002,Juan López,juan@email.com,0987654322
-- PART_003,Ana Martínez,ana@email.com,0987654323


-- Paso 1: Importar desde CSV directamente a Supabase
-- En el dashboard de Supabase: Data > encuesta_participantes > Insert > "Insert from CSV"
-- 
-- O ejecuta queries como:

INSERT INTO public.encuesta_participantes (
  id_participante,
  nombre,
  email,
  telefono,
  estado,
  fecha_inicio
) VALUES
  ('PART_001', 'Maria García', 'maria@email.com', '0987654321', 'borrador', now()),
  ('PART_002', 'Juan López', 'juan@email.com', '0987654322', 'borrador', now()),
  ('PART_003', 'Ana Martínez', 'ana@email.com', '0987654323', 'borrador', now()),
  ('PART_004', 'Carmen Rodríguez', 'carmen@email.com', '0987654324', 'borrador', now()),
  ('PART_005', 'Rosa Flores', 'rosa@email.com', '0987654325', 'borrador', now())
ON CONFLICT (id_participante) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. VERIFICAR QUE LAS PREGUNTAS EXISTAN
-- ─────────────────────────────────────────────────────────────────────────────

-- Ver todos los bloques
SELECT id, nombre, descripcion FROM public.encuesta_bloques ORDER BY orden;

-- Ver preguntas del primer bloque
SELECT id, numero_pregunta, pregunta FROM public.encuesta_preguntas 
WHERE id_bloque = (SELECT id FROM public.encuesta_bloques WHERE nombre = 'Información Base')
ORDER BY numero_pregunta;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. IMPORTAR RESPUESTAS DESDE CSV
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Tu CSV de respuestas debe tener:
-- id_participante | numero_pregunta | respuesta
--
-- Ejemplo:
-- PART_001,1,Parroquia 1
-- PART_001,2,Comercio
-- PART_002,1,Parroquia 2
-- PART_002,2,Servicios


-- Primero, obtén los IDs de las preguntas:
WITH preguntas_map AS (
  SELECT 
    p.id as pregunta_id,
    p.numero_pregunta,
    p.id_bloque,
    b.nombre as bloque_nombre
  FROM public.encuesta_preguntas p
  JOIN public.encuesta_bloques b ON p.id_bloque = b.id
  WHERE p.activo = TRUE
  ORDER BY p.numero_pregunta
)
SELECT * FROM preguntas_map LIMIT 10;


-- Opción A: Importar respuestas individuales
INSERT INTO public.encuesta_respuestas_csv (
  id_participante,
  id_pregunta,
  respuesta
)
VALUES
  -- Participante 1, Pregunta 1 (Parroquia)
  ('PART_001', (SELECT id FROM public.encuesta_preguntas WHERE numero_pregunta = 1 AND id_bloque = (SELECT id FROM public.encuesta_bloques WHERE nombre = 'Información Base') LIMIT 1), 'Parroquia Centro'),
  
  -- Participante 1, Pregunta 2 (Sector)
  ('PART_001', (SELECT id FROM public.encuesta_preguntas WHERE numero_pregunta = 2 AND id_bloque = (SELECT id FROM public.encuesta_bloques WHERE nombre = 'Información Base') LIMIT 1), 'Comercio minorista'),
  
  -- Participante 2, Pregunta 1
  ('PART_002', (SELECT id FROM public.encuesta_preguntas WHERE numero_pregunta = 1 AND id_bloque = (SELECT id FROM public.encuesta_bloques WHERE nombre = 'Información Base') LIMIT 1), 'Parroquia Sur'),
  
  -- Participante 2, Pregunta 2
  ('PART_002', (SELECT id FROM public.encuesta_preguntas WHERE numero_pregunta = 2 AND id_bloque = (SELECT id FROM public.encuesta_bloques WHERE nombre = 'Información Base') LIMIT 1), 'Servicios profesionales')
ON CONFLICT (id_participante, id_pregunta) DO UPDATE SET
  respuesta = EXCLUDED.respuesta;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. IMPORTAR RESPUESTAS MÚLTIPLES (CHECKBOX)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Para preguntas tipo checkbox, usa respuesta_array:

INSERT INTO public.encuesta_respuestas_csv (
  id_participante,
  id_pregunta,
  respuesta_array
)
VALUES
  -- Ejemplo: Pregunta de múltiples selecciones
  ('PART_001', (SELECT id FROM public.encuesta_preguntas WHERE numero_pregunta = 5 LIMIT 1), ARRAY['Redes sociales', 'Publicidad local']),
  ('PART_002', (SELECT id FROM public.encuesta_preguntas WHERE numero_pregunta = 5 LIMIT 1), ARRAY['Word of mouth', 'Página web'])
ON CONFLICT (id_participante, id_pregunta) DO UPDATE SET
  respuesta_array = EXCLUDED.respuesta_array;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. MARCAR ENCUESTAS COMO ENVIADAS
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.encuesta_participantes
SET 
  estado = 'enviada',
  fecha_envio = now(),
  fecha_actualizacion = now()
WHERE id_participante IN ('PART_001', 'PART_002', 'PART_003');


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. VERIFICAR DATOS IMPORTADOS
-- ─────────────────────────────────────────────────────────────────────────────

-- Ver participantes
SELECT * FROM public.encuesta_participantes;

-- Ver respuestas de un participante
SELECT 
  ep.id_participante,
  ep2.numero_pregunta,
  ep2.pregunta,
  er.respuesta,
  er.respuesta_array
FROM public.encuesta_respuestas_csv er
JOIN public.encuesta_preguntas ep2 ON er.id_pregunta = ep2.id
FULL OUTER JOIN public.encuesta_participantes ep ON er.id_participante = ep.id_participante
WHERE er.id_participante = 'PART_001'
ORDER BY ep2.numero_pregunta;

-- Ver resumen por participante
SELECT 
  ep.id_participante,
  ep.nombre,
  ep.estado,
  COUNT(er.id) as respuestas_guardadas,
  ep.fecha_envio
FROM public.encuesta_participantes ep
LEFT JOIN public.encuesta_respuestas_csv er ON ep.id_participante = er.id_participante
GROUP BY ep.id_participante, ep.nombre, ep.estado, ep.fecha_envio
ORDER BY ep.id_participante;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. EXPORTAR DATOS (para análisis)
-- ─────────────────────────────────────────────────────────────────────────────

-- Exportar todas las respuestas en formato wide
SELECT 
  ep.id_participante,
  ep.nombre,
  ep.email,
  ep.estado,
  ep.fecha_envio
FROM public.encuesta_participantes ep
WHERE ep.estado = 'enviada';

-- Exportar respuestas por pregunta
SELECT 
  ep.id_participante,
  ep2.numero_pregunta,
  ep2.pregunta,
  COALESCE(er.respuesta, array_to_string(er.respuesta_array, ', ')) as respuesta
FROM public.encuesta_respuestas_csv er
JOIN public.encuesta_preguntas ep2 ON er.id_pregunta = ep2.id
JOIN public.encuesta_participantes ep ON er.id_participante = ep.id_participante
ORDER BY ep.id_participante, ep2.numero_pregunta;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. LIMPIAR DATOS (si necesitas empezar de nuevo)
-- ─────────────────────────────────────────────────────────────────────────────

-- ⚠️  CUIDADO: Esto elimina datos. Usa solo si sabes lo que haces.

-- Eliminar respuestas de un participante
-- DELETE FROM public.encuesta_respuestas_csv WHERE id_participante = 'PART_001';

-- Eliminar todos los participantes
-- DELETE FROM public.encuesta_participantes;

-- Eliminar todas las respuestas
-- DELETE FROM public.encuesta_respuestas_csv;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. SCRIPT COMPLETO DE EJEMPLO
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Copia y pega todo esto para importar datos de prueba completos:

BEGIN TRANSACTION;

-- Agregar participantes
INSERT INTO public.encuesta_participantes (
  id_participante, nombre, email, telefono, estado, fecha_inicio
) VALUES
  ('TEST_001', 'Test Participante 1', 'test1@email.com', '0987654321', 'borrador', now()),
  ('TEST_002', 'Test Participante 2', 'test2@email.com', '0987654322', 'borrador', now())
ON CONFLICT (id_participante) DO NOTHING;

-- Obtener IDs de preguntas (bloque 1)
WITH preg_ids AS (
  SELECT 
    p.id,
    p.numero_pregunta,
    b.nombre as bloque
  FROM public.encuesta_preguntas p
  JOIN public.encuesta_bloques b ON p.id_bloque = b.id
  WHERE b.nombre = 'Información Base'
    AND p.activo = TRUE
  LIMIT 2
)
INSERT INTO public.encuesta_respuestas_csv (
  id_participante,
  id_pregunta,
  respuesta
)
SELECT 
  'TEST_001',
  id,
  CASE numero_pregunta
    WHEN 1 THEN 'Parroquia Centro'
    WHEN 2 THEN 'Comercio'
  END
FROM preg_ids;

-- Marcar como enviada
UPDATE public.encuesta_participantes
SET estado = 'enviada', fecha_envio = now()
WHERE id_participante = 'TEST_001';

COMMIT;


-- ═════════════════════════════════════════════════════════════════════════════
-- FIN DE LA GUÍA
-- ═════════════════════════════════════════════════════════════════════════════
