-- =============================================================================
-- Script para resetear todos los datos de encuestas
-- CUIDADO: Esto eliminará todas las respuestas guardadas
-- =============================================================================

-- Resetear respuestas de encuesta
TRUNCATE TABLE public.encuesta_respuestas CASCADE;

-- Resetear sesiones anónimas
TRUNCATE TABLE public.encuesta_sesiones CASCADE;

-- Si querías resetear SOLO respuestas pero mantener la estructura:
-- DELETE FROM public.encuesta_respuestas;
-- DELETE FROM public.encuesta_sesiones;

-- Para resetear completamente (bloques, preguntas y respuestas):
-- TRUNCATE TABLE public.encuesta_respuestas CASCADE;
-- TRUNCATE TABLE public.encuesta_preguntas CASCADE;
-- TRUNCATE TABLE public.encuesta_bloques CASCADE;
-- TRUNCATE TABLE public.encuesta_sesiones CASCADE;

-- Confirmar los datos fueron eliminados
SELECT 'Respuestas eliminadas: ' || COUNT(*) FROM public.encuesta_respuestas;
SELECT 'Sesiones eliminadas: ' || COUNT(*) FROM public.encuesta_sesiones;
