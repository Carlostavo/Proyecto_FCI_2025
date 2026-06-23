-- =============================================================================
-- Encuesta Inicial Corregida - Mujeres Emprendedoras Indígenas Guayaquil
-- Estructura normalizada con preguntas correctas
-- =============================================================================

-- Tabla principal de encuestas
CREATE TABLE IF NOT EXISTS public.encuestas_iniciales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fecha_inicio TIMESTAMPTZ DEFAULT now(),
  fecha_finalizacion TIMESTAMPTZ,
  estado TEXT DEFAULT 'en_progreso',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Bloque 1: Información base del negocio
CREATE TABLE IF NOT EXISTS public.encuesta_informacion_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL,
  parroquia TEXT,
  parroquia_otro TEXT,
  sector_especifico TEXT,
  anos_emprendimiento TEXT,
  sector_principal TEXT,
  sector_principal_otro TEXT,
  ingreso_mensual TEXT,
  nivel_instruccion TEXT,
  etnia_autoidentificacion TEXT,
  pueblo_nacionalidad TEXT,
  etnia_otro TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (encuesta_id) REFERENCES public.encuestas_iniciales(id) ON DELETE CASCADE
);

-- Bloque 2: Gestión y Finanzas del Negocio
CREATE TABLE IF NOT EXISTS public.encuesta_gestion_finanzas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL,
  papeles_negocio TEXT,
  lleva_control_dinero TEXT,
  planifica_metas TEXT,
  guarda_ganancias TEXT,
  fija_precios TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (encuesta_id) REFERENCES public.encuestas_iniciales(id) ON DELETE CASCADE
);

-- Bloque 3: Marketing y Tecnología del Negocio
CREATE TABLE IF NOT EXISTS public.encuesta_marketing_tecnologia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL,
  promociona_negocio TEXT,
  formas_promocion TEXT[],
  formas_promocion_otro TEXT,
  usa_opiniones_clientes TEXT,
  dispositivo_internet TEXT,
  tipo_dispositivo TEXT[],
  tipo_dispositivo_otro TEXT,
  usa_apps_digitales TEXT,
  apps_utilizadas TEXT[],
  apps_utilizadas_otro TEXT,
  usa_pagos_digitales TEXT,
  pagos_digitales TEXT[],
  pagos_digitales_otro TEXT,
  dificultad_tecnologia TEXT,
  dificultad_tecnologia_otro TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (encuesta_id) REFERENCES public.encuestas_iniciales(id) ON DELETE CASCADE
);

-- Bloque 4: Cultura e Identidad del Negocio
CREATE TABLE IF NOT EXISTS public.encuesta_cultura_identidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL,
  incorpora_cultura TEXT,
  elementos_culturales TEXT[],
  elementos_culturales_otro TEXT,
  origen_conocimientos TEXT,
  origen_conocimientos_otro TEXT,
  participa_grupos TEXT,
  grupos_participa TEXT[],
  grupos_participa_otro TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (encuesta_id) REFERENCES public.encuestas_iniciales(id) ON DELETE CASCADE
);

-- Bloque 5: Participación en Programa
CREATE TABLE IF NOT EXISTS public.encuesta_participacion_programa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL,
  desea_participar TEXT,
  contacto TEXT,
  modalidad_preferida TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (encuesta_id) REFERENCES public.encuestas_iniciales(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_encuestas_user_id ON public.encuestas_iniciales(user_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_estado ON public.encuestas_iniciales(estado);
CREATE INDEX IF NOT EXISTS idx_encuestas_fecha ON public.encuestas_iniciales(created_at);

-- RLS (Row Level Security) para encuestas
ALTER TABLE public.encuestas_iniciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_informacion_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_gestion_finanzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_marketing_tecnologia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_cultura_identidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuesta_participacion_programa ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para encuestas_iniciales
CREATE POLICY "Users can view their own surveys" ON public.encuestas_iniciales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own surveys" ON public.encuestas_iniciales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys" ON public.encuestas_iniciales
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para informacion_base
CREATE POLICY "Users can view their own survey data" ON public.encuesta_informacion_base
  FOR SELECT USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own survey data" ON public.encuesta_informacion_base
  FOR INSERT WITH CHECK (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own survey data" ON public.encuesta_informacion_base
  FOR UPDATE USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

-- Aplicar políticas similares a las demás tablas de encuesta
CREATE POLICY "Users can view gestion finanzas" ON public.encuesta_gestion_finanzas
  FOR SELECT USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert gestion finanzas" ON public.encuesta_gestion_finanzas
  FOR INSERT WITH CHECK (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update gestion finanzas" ON public.encuesta_gestion_finanzas
  FOR UPDATE USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view marketing tecnologia" ON public.encuesta_marketing_tecnologia
  FOR SELECT USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert marketing tecnologia" ON public.encuesta_marketing_tecnologia
  FOR INSERT WITH CHECK (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update marketing tecnologia" ON public.encuesta_marketing_tecnologia
  FOR UPDATE USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view cultura identidad" ON public.encuesta_cultura_identidad
  FOR SELECT USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cultura identidad" ON public.encuesta_cultura_identidad
  FOR INSERT WITH CHECK (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cultura identidad" ON public.encuesta_cultura_identidad
  FOR UPDATE USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view participacion programa" ON public.encuesta_participacion_programa
  FOR SELECT USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert participacion programa" ON public.encuesta_participacion_programa
  FOR INSERT WITH CHECK (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update participacion programa" ON public.encuesta_participacion_programa
  FOR UPDATE USING (
    encuesta_id IN (
      SELECT id FROM public.encuestas_iniciales WHERE user_id = auth.uid()
    )
  );
