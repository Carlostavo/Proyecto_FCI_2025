# Guía de Implementación Rápida - Encuesta Dinámica

## ⏱️ 5 Minutos para Empezar

### Paso 1️⃣ - Ejecutar SQL en Supabase (2 min)

1. Ve a [Supabase Dashboard](https://supabase.com)
2. Abre tu proyecto
3. Click en **SQL Editor** (lado izquierdo)
4. Click en **New Query**
5. **Copia el contenido COMPLETO** de este archivo:
   ```
   /scripts/008_encuesta_anonima_sin_userid.sql
   ```
6. **Pega todo** en el editor SQL
7. Click en **Run** (botón azul arriba)
8. Espera a que termine ✅

### Paso 2️⃣ - Verificar en Supabase (1 min)

En la misma ventana de SQL, ejecuta:
```sql
SELECT COUNT(*) as total_bloques FROM encuesta_bloques;
SELECT COUNT(*) as total_preguntas FROM encuesta_preguntas;
```

Deberías ver:
- `total_bloques: 5`
- `total_preguntas: 23`

### Paso 3️⃣ - Abrir Panel de Admin (2 min)

1. En tu app, inicia sesión como **Administradora**
2. Ve a `/diagnostico-admin`
3. Deberías ver los 5 bloques listados
4. Haz click en "Pregunta" dentro de un bloque para ver las preguntas

### Paso 4️⃣ - Probar la Encuesta (Opcional)

1. Cierra sesión de administradora
2. Ve a `/diagnostico` como cualquier usuario
3. Deberías ver los bloques cargados automáticamente
4. Responde una o dos preguntas
5. Click en "Enviar"
6. Verifica en Supabase que se guardaron

---

## 📊 Tabla de Problemas y Soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| Error al ejecutar SQL | Sintaxis incorrecta | Copia TODO el script nuevamente, sin editar |
| No aparecen bloques en `/diagnostico-admin` | SQL no ejecutó completo | Recarga la página, verifica en Supabase |
| Error 500 en el navegador | API no existe | Verifica que los archivos en `app/api/admin/survey/` existan |
| Preguntas no aparecen en encuesta | `activo = FALSE` | En admin, haz click en el ojo para mostrar |
| Cambios no se reflejan | Cache del navegador | Limpia: `Ctrl+Shift+Del` |

---

## 🎯 Acciones Comunes en Admin

### ➕ Crear Nueva Pregunta

1. Abre `/diagnostico-admin`
2. En el bloque deseado, click en botón **"Pregunta"**
3. Rellena:
   - **Pregunta**: el texto de la pregunta
   - **Tipo de Respuesta**: elige uno (texto, opción múltiple, etc.)
   - **Opciones**: si es múltiple, una por línea
   - **Requerida**: marca si es obligatoria
4. Click en **"Crear"**

### ✏️ Editar Pregunta Existente

1. En admin, ubica la pregunta
2. Click en icono de lápiz ✏️
3. Modifica lo que necesites
4. Click en **"Actualizar"**

### 👁️ Ocultar Pregunta (sin eliminar)

1. Click en icono de ojo 👁️
2. Se marca como "Oculta"
3. Los datos históricos se conservan
4. Puedes mostrarla nuevamente click en ojo

### 🗑️ Eliminar Pregunta

1. Click en icono de papelera 🗑️
2. Confirma el diálogo
3. Se marca como inactiva (soft delete)

---

## 💾 Resetear Datos (Si Es Necesario)

### ¿Solo quieres limpiar respuestas?
```sql
TRUNCATE TABLE public.encuesta_respuestas CASCADE;
TRUNCATE TABLE public.encuesta_sesiones CASCADE;
```

### ¿Quieres empezar 100% de cero?
```sql
TRUNCATE TABLE public.encuesta_respuestas CASCADE;
TRUNCATE TABLE public.encuesta_preguntas CASCADE;
TRUNCATE TABLE public.encuesta_bloques CASCADE;
TRUNCATE TABLE public.encuesta_sesiones CASCADE;
```

Luego re-ejecuta el script `008_encuesta_anonima_sin_userid.sql`

---

## 🔍 Verificar que Todo Funciona

### Checklist Final:

- [ ] Ejecuté SQL 008 en Supabase
- [ ] Veo 5 bloques en `/diagnostico-admin`
- [ ] Veo 23 preguntas en total
- [ ] Puedo crear una nueva pregunta
- [ ] Puedo editar una pregunta
- [ ] Puedo ocultar/mostrar preguntas
- [ ] Puedo eliminar preguntas
- [ ] Respondo la encuesta en `/diagnostico`
- [ ] Las respuestas se guardan en BD

---

## 📞 ¿Necesitas Ayuda?

1. **Lee** `RESUMEN_ENCUESTA_DINAMICA.md` para más detalles
2. **Verifica** que el SQL ejecutó sin errores
3. **Recarga** el navegador (Ctrl+F5)
4. **Limpia cache** (Ctrl+Shift+Del)
5. **Abre consola** (F12) y busca errores rojo

---

## 🚀 Próximos Pasos

Una vez que todo funcione:

1. **Personaliza las preguntas** según tus necesidades
2. **Oculta las preguntas** que no uses
3. **Crea nuevas preguntas** si lo necesitas
4. **Revisa los datos** de emprendedoras en Supabase
5. **Genera reportes** basados en las respuestas

---

**¡Listo! Tu encuesta dinámica está funcionando.**
