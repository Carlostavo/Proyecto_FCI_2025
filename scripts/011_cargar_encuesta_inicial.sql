-- ============================================================================
-- SCRIPT: Cargar encuesta inicial con bloques y preguntas
-- ============================================================================
-- Este script carga la encuesta inicial del CSV con 30 preguntas en 5 bloques

-- 1. OBTENER O CREAR LA ENCUESTA INICIAL
-- Si ya existe, obtén su ID; si no, créala
WITH encuesta_inicial AS (
  INSERT INTO public.encuestas (titulo, descripcion, es_inicial, estado, activo)
  VALUES (
    'Diagnóstico Inicial',
    'Encuesta diagnóstica para conocer el estado actual de tu emprendimiento',
    true,
    true,
    true
  )
  ON CONFLICT DO NOTHING
  RETURNING id
)
-- 2. INSERTAR BLOQUES TEMÁTICOS
, bloques_data AS (
  INSERT INTO public.encuesta_bloques (encuesta_id, titulo, descripcion, orden, estado, activo)
  SELECT
    (SELECT id FROM public.encuestas WHERE es_inicial = true LIMIT 1),
    bloque_titulo,
    bloque_desc,
    bloque_orden,
    true,
    true
  FROM (
    VALUES
      ('Información Base del Negocio', 'Información sobre la ubicación y características básicas del emprendimiento', 1),
      ('Gestión y Finanzas', 'Gestión empresarial y control financiero', 2),
      ('Marketing y Tecnología', 'Estrategias de promoción y uso de tecnología', 3),
      ('Cultura e Identidad', 'Elementos culturales y participación comunitaria', 4),
      ('Participación en Programa', 'Interés en participar en programas de formación', 5)
  ) AS bloques(bloque_titulo, bloque_desc, bloque_orden)
  ON CONFLICT DO NOTHING
  RETURNING id, orden
)

-- 3. INSERTAR PREGUNTAS (Dentro de cada bloque)
INSERT INTO public.encuesta_preguntas (bloque_id, pregunta, tipo, opciones, requerido, orden, estado, activo)
SELECT
  (SELECT id FROM public.encuesta_bloques WHERE encuesta_id = (SELECT id FROM public.encuestas WHERE es_inicial = true LIMIT 1) AND orden = bloque_orden LIMIT 1),
  pregunta_texto,
  pregunta_tipo,
  CASE WHEN opciones_json IS NOT NULL THEN opciones_json::jsonb ELSE NULL END,
  true,
  pregunta_orden,
  true,
  true
FROM (
  -- BLOQUE 1: Información Base (7 preguntas)
  VALUES
    (1, 1, '¿En cuál parroquia de Guayaquil se ubica tu negocio?', 'radio', '{"opciones": ["Ximena", "Tarqui", "Pascuales", "La puntilla", "Chongón", "Vinces", "Febres cordero", "Samborondon", "Tarifa", "Otra"]}'),
    (1, 2, '¿Cuál es el sector en donde se encuentra ubicado el emprendimiento? (Ciudadela/barrio/cooperativa)', 'texto', NULL),
    (1, 3, '¿Cuántos años lleva tu negocio activo?', 'radio', '{"opciones": ["Menos de 1 año", "1–3 años", "4–6 años", "7–10 años", "Más de 10 años"]}'),
    (1, 4, '¿De dónde proviene la economía del hogar?', 'radio', '{"opciones": ["Solo del emprendimiento", "Del emprendimiento + otros trabajos", "Otros trabajos principalmente"]}'),
    (1, 5, '¿Cuál es el rango de ingresos mensuales aproximados?', 'radio', '{"opciones": ["100-199 USD", "200-399 USD", "400-599 USD", "600-999 USD", "1000 USD o más"]}'),
    (1, 6, '¿Cuál es tu nivel de instrucción?', 'radio', '{"opciones": ["Primaria", "Secundaria", "Técnico", "Superior", "Postgrado"]}'),
    (1, 7, '¿Con cuál grupo cultural te autoidentificas?', 'radio', '{"opciones": ["Mestizo", "Indígena", "Afroecuatoriano", "Montubio", "Otro"]}'),
    
    -- BLOQUE 2: Gestión y Finanzas (5 preguntas)
    (2, 8, '¿Tu negocio está formalizado ante las autoridades?', 'radio', '{"opciones": ["Sí", "No", "En proceso"]}'),
    (2, 9, '¿Llevas control de dinero en tu negocio (ingresos, gastos)?', 'radio', '{"opciones": ["Sí, en libro o cuaderno", "Sí, con aplicaciones/software", "No llevo control"]}'),
    (2, 10, '¿Tienes metas financieras claras para este año?', 'radio', '{"opciones": ["Sí", "No", "Parcialmente"]}'),
    (2, 11, '¿Cuál es tu ganancia promedio mensual neto?', 'radio', '{"opciones": ["Pérdida o nula", "Menos de 100 USD", "100-300 USD", "300-700 USD", "Más de 700 USD"]}'),
    (2, 12, '¿Cómo estableces los precios de tus productos/servicios?', 'radio', '{"opciones": ["Por costo + porcentaje", "Por competencia", "Por intuición", "Otra"]}'),
    
    -- BLOQUE 3: Marketing y Tecnología (6 preguntas)
    (3, 13, '¿Cómo promocionas tu negocio?', 'checkbox', '{"opciones": ["Redes sociales", "Boca a boca", "Publicidad pagada", "Google Maps/directorios", "Volantes/afiches", "Otro"]}'),
    (3, 14, '¿Qué tan importante son las opiniones/reseñas de clientes?', 'radio', '{"opciones": ["Muy importante", "Importante", "Poco importante", "No me interesa"]}'),
    (3, 15, '¿Qué dispositivos usas para tu negocio?', 'checkbox', '{"opciones": ["Celular", "Computadora", "Tablet", "Punto de venta electrónico", "Ninguno"]}'),
    (3, 16, '¿Usas aplicaciones para gestionar tu negocio?', 'radio', '{"opciones": ["Sí", "No", "No sé cuáles existen"]}'),
    (3, 17, '¿Aceptas pagos digitales en tu negocio?', 'radio', '{"opciones": ["Sí, siempre", "A veces", "No, solo efectivo"]}'),
    (3, 18, '¿Tienes presencia en redes sociales?', 'radio', '{"opciones": ["Sí, activa", "Sí, pero poco activa", "No tengo"]}'),
    
    -- BLOQUE 4: Cultura e Identidad (3 preguntas)
    (4, 19, '¿Tu negocio incorpora elementos culturales en su identidad?', 'radio', '{"opciones": ["Sí", "No", "Parcialmente"]}'),
    (4, 20, '¿De dónde es el origen de tu producto/servicio?', 'radio', '{"opciones": ["Tradición familiar", "Inspiración personal", "Copia de otro negocio", "Tendencia de mercado"]}'),
    (4, 21, '¿Participas en grupos comunitarios o asociaciones?', 'radio', '{"opciones": ["Sí", "No", "Me gustaría participar"]}'),
    
    -- BLOQUE 5: Participación en Programa (2 preguntas)
    (5, 22, '¿Desearías participar en nuestro programa de formación?', 'radio', '{"opciones": ["Sí, totalmente", "Sí, pero con restricciones", "No"]}'),
    (5, 23, '¿Cuál sería tu forma preferida de participación?', 'radio', '{"opciones": ["Presencial", "Virtual", "Híbrida (presencial + virtual)"]}')
) AS preguntas(bloque_orden, pregunta_orden, pregunta_texto, pregunta_tipo, opciones_json)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN (ejecutar después para confirmar)
-- ============================================================================
-- SELECT 
--   e.titulo,
--   COUNT(DISTINCT b.id) as total_bloques,
--   COUNT(DISTINCT p.id) as total_preguntas
-- FROM public.encuestas e
-- LEFT JOIN public.encuesta_bloques b ON e.id = b.encuesta_id
-- LEFT JOIN public.encuesta_preguntas p ON b.id = p.bloque_id
-- WHERE e.es_inicial = true
-- GROUP BY e.id, e.titulo;

-- ============================================================================
-- FIN
-- ============================================================================
