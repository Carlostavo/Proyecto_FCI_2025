# Encuesta Diagnóstica - Configuración Final

## Cambios Realizados

La encuesta ahora funciona de manera **simplificada y directa**, sin sincronización dinámica:

### Antes ❌
- Encuesta dinámica con tablas separadas (`encuesta_bloques`, `encuesta_preguntas`, `encuesta_respuestas`)
- Requería panel administrativo para crear preguntas
- Sincronización automática entre tablas

### Ahora ✅
- Encuesta **fija y directa** usando tabla existente `cuestionario_limpio_respuestas`
- 30 preguntas codificadas en el componente
- Almacenamiento simple y sin usuario_id
- Identificación por `id_sesion` (anónimo único por sesión)

---

## Estructura Actual

### 1. Tabla de Almacenamiento
**`public.cuestionario_limpio_respuestas`**

```sql
-- Tabla existente (ya creada)
CREATE TABLE public.cuestionario_limpio_respuestas (
  id BIGSERIAL PRIMARY KEY,
  marca_temporal TIMESTAMPTZ,
  -- 32 columnas para cada pregunta de la encuesta
  parroquia TEXT,
  sector_ubicacion TEXT,
  antiguedad_emprendimiento TEXT,
  ... (30 preguntas totales)
  modalidad_preferida TEXT
);
```

**Características:**
- Sin campo `user_id` (completamente anónimo)
- Timestamp automático de respuesta
- RLS configurado (solo admin puede leer)

### 2. Componente Frontend
**`components/survey/dynamic-survey-form.tsx`**

- 30 preguntas estructuradas
- Navegación paso a paso
- Tipos de respuesta: texto, radio, checkbox, numérica
- Generación automática de `id_sesion` (anónimo único)
- Botones: Anterior, Siguiente, Guardar Borrador, Enviar Encuesta

### 3. APIs REST

#### `POST /api/survey/save-draft`
```javascript
Request:
{
  sesionId: "sesion_1234567890_abc123",
  respuestas: { /* respuestas parciales */ },
  timestamp: "2025-06-23T10:30:00Z"
}

Response:
{ success: true }
```

#### `POST /api/survey/submit`
```javascript
Request:
{
  sesionId: "sesion_1234567890_abc123",
  respuestas: { /* todas las respuestas */ },
  timestamp: "2025-06-23T10:30:00Z"
}

Response:
{
  success: true,
  message: "Encuesta enviada correctamente",
  data: [{ id: 123, ... }]
}
```

---

## Flujo de la Encuesta

```
Emprendedora abre /diagnostico
         ↓
Se genera id_sesion único (anónimo)
         ↓
Responde 30 preguntas (navegación paso a paso)
         ↓
Opción 1: Guardar Borrador → /api/survey/save-draft
         ↓
Opción 2: Enviar Encuesta → /api/survey/submit
         ↓
Datos se guardan en cuestionario_limpio_respuestas
         ↓
Confirmación: "Encuesta enviada correctamente"
```

---

## Las 30 Preguntas

### Bloque 1: Información del Emprendimiento (7 preguntas)
1. Parroquia ubicación
2. Sector/barrio ubicación
3. Antigüedad emprendimiento
4. Sector económico
5. Ingreso mensual
6. Nivel instrucción
7. Etnia/identificación

### Bloque 2: Gestión y Finanzas (6 preguntas)
8. Situación formalización
9. Control dinero
10. Planificación de metas
11. Reinversión ganancias
12. Definición de precios
13. Promoción del negocio

### Bloque 3: Marketing y Tecnología (7 preguntas)
14. Medios de promoción
15. Uso de sugerencias clientes
16. Dispositivo internet
17. Dispositivos usados
18. Uso apps digitales
19. Apps utilizadas
20. Uso pagos digitales

### Bloque 4: Tecnología y Dificultades (3 preguntas)
21. Pagos digitales usados
22. Dificultad con tecnología
23. Incorpora cultura

### Bloque 5: Cultura e Identidad (5 preguntas)
24. Elementos culturales
25. Origen conocimiento cultural
26. Participación en asociaciones
27. Asociaciones particulares
28. Interés en programa

### Bloque 6: Contacto y Modalidad (2 preguntas)
29. Preferencia contacto
30. Modalidad preferida

---

## URLs Principales

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/diagnostico` | Emprendedora | Encuesta de 30 preguntas |
| `/diagnostico-admin` | Administradora | Panel informativo (READ-ONLY) |
| `/api/survey/save-draft` | - | Guardar borrador |
| `/api/survey/submit` | - | Enviar encuesta completa |

---

## Características de Seguridad

✅ **Sin user_id** - Completamente anónimo  
✅ **id_sesion único** - Identifica sesión sin usuario  
✅ **RLS Configurado** - Solo admin puede leer datos  
✅ **Timestamp automático** - Rastreo de cuándo se respondió  
✅ **Validación en servidor** - No confía en datos del cliente  

---

## Cómo Importar Datos Existentes (Opcional)

Si tienes datos en CSV (como `BD_limpia.csv`):

```sql
-- En Supabase, usa COPY o importa manualmente
COPY public.cuestionario_limpio_respuestas (
  marca_temporal, parroquia, sector_ubicacion, ...
) FROM STDIN WITH (FORMAT csv);
```

Los datos se mostrarán en el dashboard automáticamente.

---

## Debugging

### Verificar datos guardados
```sql
SELECT COUNT(*) FROM public.cuestionario_limpio_respuestas;
SELECT * FROM public.cuestionario_limpio_respuestas LIMIT 5;
```

### Ver respuestas de una sesión
```sql
SELECT marca_temporal, parroquia, sector_economico 
FROM public.cuestionario_limpio_respuestas 
WHERE marca_temporal > NOW() - INTERVAL '1 hour';
```

---

## Archivos Clave

```
components/survey/
├── dynamic-survey-form.tsx ✅ (30 preguntas codificadas)
└── initial-survey-form.tsx (antiguo, no usado)

app/api/survey/
├── save-draft/route.ts ✅
└── submit/route.ts ✅

app/diagnostico/
├── page.tsx ✅ (usa DynamicSurveyForm)

app/diagnostico-admin/
└── page.tsx ✅ (panel informativo)

scripts/
├── 004_cuestionario_limpio_dashboard.sql (BD existente)
└── PREGUNTAS_REFERENCIA.json (referencia)
```

---

## Estado: ✅ LISTO PARA USAR

**Última actualización:** 2025-06-23  
**Versión:** 2.0 - Encuesta Simple y Directa  
**Tabla:** `cuestionario_limpio_respuestas` (sin sincronización)
