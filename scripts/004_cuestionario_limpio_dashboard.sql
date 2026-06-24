-- =============================================================================
-- Kawsay Emprende Guayaquil - fuente real para dashboard desde BD_limpia.xlsx
-- Ejecutar en Supabase antes de importar el Excel.
-- Columnas mapeadas 1:1 con los encabezados del archivo BD_limpia.xlsx
-- =============================================================================
 
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
 
-- -----------------------------------------------------------------------------
-- TABLA PRINCIPAL
-- Orden de columnas = orden exacto del Excel (columna 0 → columna 30)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cuestionario_limpio_respuestas (
  id                            BIGSERIAL PRIMARY KEY,
 
  -- Col 0: Ubicación
  ubicacion                     TEXT,
 
  -- Col 1: 1. ¿En qué parroquia se encuentra ubicado el emprendimiento?
  parroquia                     TEXT,
 
  -- Col 2: 2. ¿Cuál es el sector en donde se encuentra ubicado el emprendimiento? Ciudadela/barrio/cooperativa
  sector_ubicacion              TEXT,
 
  -- Col 3: 3. ¿Cuántos años tiene vigente el emprendimiento?
  antiguedad_emprendimiento     TEXT,
 
  -- Col 4: 4. ¿Cuál es el principal sector económico del emprendimiento?
  sector_economico              TEXT,
 
  -- Col 5: 5. ¿Cuál es el ingreso mensual aproximado que genera el emprendimiento?
  ingreso_mensual               TEXT,
 
  -- Col 6: 6. ¿Cuál es su mayor nivel de instrucción formal alcanzado? (nivel educativo de la emprendedora)
  nivel_instruccion             TEXT,
 
  -- Col 7: 7. ¿Con que etnia se auto identifica?
  etnia                         TEXT,
 
  -- Col 8: 8. Sobre los papeles de su negocio (permisos de funcionamiento, obtención de RUC, entre otros), ¿cuál es su situación actual?
  situacion_formalizacion       TEXT,
 
  -- Col 9: 9. ¿Lleva algún control o registro del dinero que gana y gasta de su negocio?
  control_dinero                TEXT,
 
  -- Col 10: 10. ¿Suele planificar lo que quiere lograr en su negocio cada mes?
  planifica_metas               TEXT,
 
  -- Col 11: 11. ¿Guarda una parte de las ganancias para volver a invertir en su negocio?
  reinvierte_ganancias          TEXT,
 
  -- Col 12: 12. Al fijar el precio de venta, ¿toma en cuenta lo que le cuesta hacerlo o comprarlo y la ganancia que espera tener?
  define_precios_costos         TEXT,
 
  -- Col 13: 13. ¿Qué hace normalmente para que más personas conozcan o compren en su negocio?
  promocion_negocio             TEXT,
 
  -- Col 14: 👉 Si marcó la segunda opción, indique las opciones que utiliza con más frecuencia
  medios_promocion              TEXT,
 
  -- Col 15: 14. ¿Utiliza las opiniones y sugerencias de sus clientes para hacer mejoras o cambios en sus productos y servicios?
  usa_sugerencias_clientes      TEXT,
 
  -- Col 16: 15. ¿Cuenta con algún dispositivo con acceso a Internet para apoyar la gestión de su negocio?
  dispositivo_internet          TEXT,
 
  -- Col 17: 👉 Si respondió "Sí" o "A veces": indique cuál utiliza con mayor frecuencia
  dispositivos_usados           TEXT,
 
  -- Col 18: 16. ¿Acostumbra a utilizar aplicaciones digitales como WhatsApp, Facebook u otros para dar a conocer sus productos?
  usa_apps_digitales            TEXT,
 
  -- Col 19: 👉 Si respondió "Sí" o "A veces": indique cuál utiliza con mayor frecuencia (apps)
  apps_usadas                   TEXT,
 
  -- Col 20: 17. ¿Acostumbra a usar pagos digitales, como transferencias bancarias o aplicaciones móviles?
  usa_pagos_digitales           TEXT,
 
  -- Col 21: 👉 Si respondió "Sí" o "A veces": indique cuál utiliza con mayor frecuencia (pagos)
  pagos_usados                  TEXT,
 
  -- Col 22: 18. ¿Cuál es la principal dificultad que ha tenido para usar la tecnología en la gestión de su negocio?
  dificultad_tecnologia         TEXT,
 
  -- Col 23: 19. ¿Incorpora elementos de su cultura o tradiciones en su negocio?
  incorpora_cultura             TEXT,
 
  -- Col 24: 👉 Si marcó "Sí" o "A veces", indique cuáles (elementos culturales)
  elementos_culturales          TEXT,
 
  -- Col 25: 20. ¿De dónde provienen esos conocimientos o prácticas culturales que aplica en su negocio?
  origen_conocimiento_cultural  TEXT,
 
  -- Col 26: 21. ¿Participa en grupos o asociaciones donde comparta su cultura o dé a conocer sus productos tradicionales?
  participa_asociaciones        TEXT,
 
  -- Col 27: 👉 Si marcó "Sí" o "A veces", indique en cuáles (asociaciones)
  asociaciones                  TEXT,
 
  -- Col 28: 22. ¿Le gustaría participar en el programa de capacitación y formación para emprendedoras?
  interes_programa              TEXT,
 
  -- Col 29: Si su respuesta fue sí, proporcionar número de WhatsApp activo o correo electrónico
  contacto_programa             TEXT,
 
  -- Col 30: 23. En caso de que desee participar, ¿en qué modalidad preferiría recibir las capacitaciones?
  modalidad_preferida           TEXT
);

CREATE INDEX IF NOT EXISTS cuestionario_limpio_parroquia_idx
  ON public.cuestionario_limpio_respuestas (parroquia);

CREATE INDEX IF NOT EXISTS cuestionario_limpio_sector_idx
  ON public.cuestionario_limpio_respuestas (sector_economico);

CREATE INDEX IF NOT EXISTS cuestionario_limpio_etnia_idx
  ON public.cuestionario_limpio_respuestas (etnia);

ALTER TABLE public.cuestionario_limpio_respuestas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cuestionario_limpio_select_roles_dashboard" ON public.cuestionario_limpio_respuestas;
CREATE POLICY "cuestionario_limpio_select_roles_dashboard"
  ON public.cuestionario_limpio_respuestas
  FOR SELECT
  USING (
    public.get_my_rol() IN (
      'administradora',
      'investigadora',
      'formadora',
      'institucion_aliada'
    )
  );

DROP POLICY IF EXISTS "cuestionario_limpio_admin_write" ON public.cuestionario_limpio_respuestas;
CREATE POLICY "cuestionario_limpio_admin_write"
  ON public.cuestionario_limpio_respuestas
  FOR ALL
  USING (public.get_my_rol() = 'administradora')
  WITH CHECK (public.get_my_rol() = 'administradora');

CREATE OR REPLACE VIEW public.v_dashboard_cuestionario_resumen AS
SELECT
  COUNT(*)::INTEGER AS total_respuestas,
  COUNT(*) FILTER (
    WHERE lower(extensions.unaccent(coalesce(situacion_formalizacion, ''))) NOT LIKE '%aun no%'
      AND lower(extensions.unaccent(coalesce(situacion_formalizacion, ''))) NOT LIKE '%no me formalizo%'
  )::INTEGER AS formalizadas,
  COUNT(*) FILTER (
    WHERE lower(extensions.unaccent(coalesce(interes_programa, ''))) LIKE '%si%'
      OR lower(extensions.unaccent(coalesce(interes_programa, ''))) LIKE '%a veces%'
  )::INTEGER AS interesadas,
  COUNT(*) FILTER (
    WHERE lower(extensions.unaccent(coalesce(dispositivo_internet, ''))) LIKE '%no%'
      OR lower(extensions.unaccent(coalesce(dispositivo_internet, ''))) LIKE '%a veces%'
      OR lower(extensions.unaccent(coalesce(usa_apps_digitales, ''))) LIKE '%no%'
      OR lower(extensions.unaccent(coalesce(usa_apps_digitales, ''))) LIKE '%a veces%'
      OR lower(extensions.unaccent(coalesce(dificultad_tecnologia, ''))) LIKE '%falta%'
      OR lower(extensions.unaccent(coalesce(dificultad_tecnologia, ''))) LIKE '%dificultad%'
      OR lower(extensions.unaccent(coalesce(dificultad_tecnologia, ''))) LIKE '%no tengo tiempo%'
  )::INTEGER AS brecha_digital
FROM public.cuestionario_limpio_respuestas;
