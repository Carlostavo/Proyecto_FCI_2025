# Sistema Completo de Encuestas Dinámicas y Sincronizadas

## Descripción General

Sistema donde:
- **Administradora** crea, edita, elimina y oculta encuestas (en `/diagnostico-admin`)
- **Emprendedoras** responden encuestas dinámicamente (en `/diagnostico`)
- **Encuesta Inicial** sincronizada con tabla `cuestionario_limpio_respuestas` (23 preguntas del CSV)
- **Nuevas Encuestas** dinámicas y condicionales creadas por administradora
- Todas las respuestas se guardan **anónimas** sin `user_id` (con `id_sesion` único)

---

## Estructura de Base de Datos

### Tablas Principales

#### 1. `encuestas`
```sql
id UUID (PK)
titulo TEXT
descripcion TEXT
es_inicial BOOLEAN (TRUE para encuesta inicial del CSV)
estado BOOLEAN (visible/oculta - soft delete)
activo BOOLEAN (eliminada/no eliminada)
creado_en TIMESTAMP
actualizado_en TIMESTAMP
```

#### 2. `encuesta_bloques`
```sql
id UUID (PK)
encuesta_id UUID (FK) - referencia a encuesta
titulo TEXT - nombre del bloque/sección
descripcion TEXT
orden INT - posición en la encuesta
estado BOOLEAN (visible/oculta)
activo BOOLEAN
```

#### 3. `encuesta_preguntas`
```sql
id UUID (PK)
bloque_id UUID (FK) - referencia a bloque
pregunta TEXT
tipo TEXT ('texto', 'numero', 'radio', 'checkbox', 'escala')
opciones JSONB - {"opciones": ["opcion1", "opcion2"]}
texto_ayuda TEXT
requerido BOOLEAN
orden INT
visible_cuando JSONB - condiciones de visibilidad
estado BOOLEAN (visible/oculta)
activo BOOLEAN
```

#### 4. `encuesta_sesiones`
```sql
id UUID (PK)
encuesta_id UUID (FK)
id_sesion TEXT (hash único anónimo) - ej: sesion_1234567890_abc123
creada_en TIMESTAMP
ultima_actividad TIMESTAMP
completada BOOLEAN
```

#### 5. `encuesta_respuestas`
```sql
id UUID (PK)
encuesta_id UUID (FK)
sesion_id UUID (FK) - de encuesta_sesiones (NO user_id)
pregunta_id UUID (FK)
respuesta TEXT
creada_en TIMESTAMP
actualizada_en TIMESTAMP
UNIQUE(sesion_id, pregunta_id)
```

#### 6. `cuestionario_limpio_respuestas` (Encuesta Inicial)
```sql
id UUID (PK)
id_sesion TEXT - anónimo, igual al de encuesta_sesiones
marca_temporal TIMESTAMP
-- 23 campos individuales (un campo por cada pregunta)
parroquia TEXT
sector_ubicacion TEXT
antiguedad_emprendimiento TEXT
... (20 campos más)
modalidad_preferida TEXT
actualizado_en TIMESTAMP
```

---

## Workflow Completo

### Para Administradora (`/diagnostico-admin`)

#### 1. Crear Encuesta
```
POST /api/encuestas
Body: {
  "titulo": "Mi Encuesta",
  "descripcion": "Descripción opcional",
  "es_inicial": false
}
Response: {
  "id": "uuid",
  "titulo": "...",
  ...
}
```

#### 2. Crear Bloque
```
POST /api/encuestas/{encuesta_id}/bloques
Body: {
  "titulo": "Sección 1",
  "descripcion": "Descripción del bloque"
}
```

#### 3. Crear Pregunta
```
POST /api/encuestas/{encuesta_id}/preguntas
Body: {
  "bloque_id": "uuid",
  "pregunta": "¿Pregunta?",
  "tipo": "radio",
  "opciones": {
    "opciones": ["opcion1", "opcion2"]
  },
  "requerido": true
}
```

#### 4. Editar Pregunta
```
PUT /api/encuestas/{encuesta_id}/preguntas/{pregunta_id}
Body: {
  "pregunta": "Nueva pregunta",
  "tipo": "checkbox",
  ...
}
```

#### 5. Ocultar Pregunta (no eliminarla)
```
PATCH /api/encuestas/{encuesta_id}/preguntas/{pregunta_id}
Body: {
  "estado": false
}
```

#### 6. Eliminar Pregunta (soft delete)
```
DELETE /api/encuestas/{encuesta_id}/preguntas/{pregunta_id}
```

#### 7. Ocultar/Mostrar Encuesta
```
PATCH /api/encuestas/{encuesta_id}
Body: {
  "estado": false
}
```

#### 8. Eliminar Encuesta (soft delete)
```
DELETE /api/encuestas/{encuesta_id}
```

---

### Para Emprendedoras (`/diagnostico`)

#### 1. Abrir encuesta → Crear Sesión Anónima
```
POST /api/encuestas/sesiones
Body: {
  "encuesta_id": "uuid"
}
Response: {
  "id": "uuid",
  "id_sesion": "sesion_1234567890_abc123",
  "encuesta_id": "uuid"
}
```
*Se guarda en localStorage para recuperar luego*

#### 2. Cargar Encuesta Completa
```
GET /api/encuestas/{encuesta_id}
Response: {
  "id": "uuid",
  "titulo": "Diagnóstico Inicial",
  "bloques": [
    {
      "id": "uuid",
      "titulo": "Bloque 1",
      "orden": 1,
      "encuesta_preguntas": [
        {
          "id": "uuid",
          "pregunta": "¿Pregunta?",
          "tipo": "radio",
          "opciones": {...},
          "requerido": true
        }
      ]
    }
  ]
}
```

#### 3. Guardar Respuesta (en tiempo real o borrador)
```
POST /api/encuestas/respuestas
Body: {
  "encuesta_id": "uuid",
  "sesion_id": "uuid",
  "pregunta_id": "uuid",
  "respuesta": "Respuesta del usuario"
}
```

#### 4. Obtener Respuestas Guardadas (para reanudar)
```
GET /api/encuestas/respuestas?sesion_id=uuid&encuesta_id=uuid
```

#### 5. Marcar como Completada
```
PATCH /api/encuestas/sesiones
Body: {
  "sesion_id": "sesion_1234567890_abc123",
  "completada": true
}
```

---

## Encuesta Inicial (CSV)

### Sincronización
- La encuesta inicial se marca con `es_inicial = true`
- Se crea automáticamente con los 5 bloques y 23 preguntas
- Las respuestas se guardan en:
  - `encuesta_respuestas` (sistema dinámico)
  - `cuestionario_limpio_respuestas` (para compatibilidad con CSV)

### Bloques (5)
1. **Información Base del Negocio** (7 preguntas)
2. **Gestión y Finanzas** (5 preguntas)
3. **Marketing y Tecnología** (6 preguntas)
4. **Cultura e Identidad** (3 preguntas)
5. **Participación en Programa** (2 preguntas)

**Total: 23 preguntas**

---

## APIs REST Disponibles

### Encuestas
- `GET /api/encuestas` - Obtener todas (emprendedoras ven tarjetas)
- `POST /api/encuestas` - Crear (administradora)
- `GET /api/encuestas/{id}` - Obtener con bloques y preguntas
- `PUT /api/encuestas/{id}` - Editar
- `PATCH /api/encuestas/{id}` - Ocultar/Mostrar
- `DELETE /api/encuestas/{id}` - Eliminar (soft delete)

### Bloques
- `POST /api/encuestas/{id}/bloques` - Crear
- `PUT /api/encuestas/{id}/bloques/{bloqueId}` - Editar
- `PATCH /api/encuestas/{id}/bloques/{bloqueId}` - Ocultar/Mostrar
- `DELETE /api/encuestas/{id}/bloques/{bloqueId}` - Eliminar (soft delete)

### Preguntas
- `POST /api/encuestas/{id}/preguntas` - Crear
- `PUT /api/encuestas/{id}/preguntas/{preguntaId}` - Editar
- `PATCH /api/encuestas/{id}/preguntas/{preguntaId}` - Ocultar/Mostrar
- `DELETE /api/encuestas/{id}/preguntas/{preguntaId}` - Eliminar (soft delete)

### Respuestas
- `POST /api/encuestas/respuestas` - Guardar respuesta
- `GET /api/encuestas/respuestas?sesion_id=...&encuesta_id=...` - Obtener respuestas

### Sesiones
- `POST /api/encuestas/sesiones` - Crear/recuperar sesión
- `PATCH /api/encuestas/sesiones` - Marcar completada

---

## Características de Seguridad

✅ **Sin user_id** - 100% anónimo con `id_sesion`
✅ **RLS (Row Level Security)** - Políticas de acceso configuradas
✅ **Soft Delete** - Datos nunca se pierden realmente
✅ **UNIQUE constraints** - No hay duplicados
✅ **Timestamp auditoría** - Rastreo completo de cambios
✅ **Validación en servidor** - No confiar en cliente

---

## Tipos de Preguntas Soportados

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `texto` | Texto libre | "¿Cuál es tu nombre?" |
| `numero` | Número | "¿Cuántos empleados tienes?" |
| `radio` | Una opción | "¿Sí o No?" |
| `checkbox` | Múltiples opciones | "¿Cuáles te interesan?" |
| `escala` | 1-5 o similar | "¿Qué tan importante es...?" |

---

## Condiciones de Visibilidad (Futuro)

Ejemplo de pregunta condicional (no implementado aún):
```json
{
  "visible_cuando": {
    "pregunta_id": "uuid",
    "valor": "Sí"
  }
}
```

La pregunta solo se muestra si la pregunta referenciada tiene el valor "Sí".

---

## Scripts SQL Necesarios

### Orden de ejecución:

1. **`010_encuesta_dinamica_completa.sql`** (PRIMERO)
   - Crea todas las tablas
   - Configura RLS
   - Crear funciones

2. **`011_cargar_encuesta_inicial.sql`** (SEGUNDO)
   - Carga la encuesta inicial
   - Carga los 5 bloques
   - Carga las 23 preguntas

---

## Pasos para Implementar

### 1. Base de Datos
```bash
# En Supabase SQL Editor, ejecutar:
# 1. 010_encuesta_dinamica_completa.sql
# 2. 011_cargar_encuesta_inicial.sql
```

### 2. APIs ya creadas en el proyecto
```
/app/api/encuestas/route.ts
/app/api/encuestas/[id]/route.ts
/app/api/encuestas/[id]/bloques/route.ts
/app/api/encuestas/[id]/bloques/[bloqueId]/route.ts
/app/api/encuestas/[id]/preguntas/route.ts
/app/api/encuestas/[id]/preguntas/[preguntaId]/route.ts
/app/api/encuestas/respuestas/route.ts
/app/api/encuestas/sesiones/route.ts
```

### 3. Componentes a crear
- `SurveyManagerAdmin` - Panel de administración
- `SurveyFormDisplay` - Formulario para emprendedoras
- `SurveyCard` - Tarjeta de encuesta

### 4. Páginas a actualizar
- `/diagnostico-admin` - Panel de gestión
- `/diagnostico` - Selección de encuestas y respuesta

---

## URLs de Acceso

| Rol | URL | Función |
|-----|-----|---------|
| Administradora | `/diagnostico-admin` | Crear, editar, eliminar encuestas |
| Emprendedora | `/diagnostico` | Ver encuestas disponibles, responder |

---

## Verificación de Setup

Ejecutar en Supabase SQL Editor:

```sql
-- Ver todas las encuestas
SELECT id, titulo, es_inicial, estado FROM public.encuestas;

-- Ver bloques de encuesta inicial
SELECT b.id, b.titulo, COUNT(p.id) as total_preguntas
FROM public.encuesta_bloques b
LEFT JOIN public.encuesta_preguntas p ON b.id = p.bloque_id
WHERE b.encuesta_id = (SELECT id FROM public.encuestas WHERE es_inicial = true LIMIT 1)
GROUP BY b.id, b.titulo
ORDER BY b.orden;

-- Ver preguntas de encuesta inicial
SELECT p.orden, p.pregunta, p.tipo
FROM public.encuesta_preguntas p
LEFT JOIN public.encuesta_bloques b ON p.bloque_id = b.id
WHERE b.encuesta_id = (SELECT id FROM public.encuestas WHERE es_inicial = true LIMIT 1)
ORDER BY b.orden, p.orden;
```

---

## Notas Importantes

1. La encuesta inicial sincroniza con `cuestionario_limpio_respuestas` para compatibilidad con CSV
2. Todas las nuevas encuestas usan el sistema dinámico (tablas: bloques, preguntas, respuestas)
3. Las respuestas son 100% anónimas (sin user_id, con id_sesion)
4. Soft delete preserva datos históricos
5. RLS protege la información sensible
6. Las condiciones de visibilidad pueden implementarse cuando sea necesario

---

Documento de referencia completo para el sistema de encuestas.
