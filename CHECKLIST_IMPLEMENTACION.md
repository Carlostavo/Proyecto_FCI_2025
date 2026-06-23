# Checklist de Implementación - Encuesta Dinámica

## ✅ Verificación de Archivos

### SQL Scripts
- [x] `scripts/008_encuesta_anonima_sin_userid.sql` - Creado y listo
- [x] `scripts/009_reset_encuesta_datos.sql` - Creado y listo
- [x] `scripts/PREGUNTAS_REFERENCIA.json` - Creado (referencia)

### Componentes React
- [x] `components/survey/survey-manager-admin.tsx` - 525 líneas, funcional
- [x] `app/diagnostico-admin/page.tsx` - Actualizado

### APIs REST (4 rutas)
- [x] `app/api/admin/survey/bloques/route.ts` - GET, POST
- [x] `app/api/admin/survey/bloques/[id]/route.ts` - DELETE
- [x] `app/api/admin/survey/preguntas/route.ts` - POST
- [x] `app/api/admin/survey/preguntas/[id]/route.ts` - PUT, PATCH, DELETE

### Documentación
- [x] `RESUMEN_ENCUESTA_DINAMICA.md` - Documentación completa
- [x] `GUIA_IMPLEMENTACION_RAPIDA.md` - Setup en 5 minutos
- [x] `CHECKLIST_IMPLEMENTACION.md` - Este archivo

---

## 📋 Pasos a Ejecutar

### Fase 1: Base de Datos (2 minutos)

#### Paso 1.1 - Copiar SQL
- [ ] Abre archivo: `scripts/008_encuesta_anonima_sin_userid.sql`
- [ ] Selecciona TODO el contenido (Ctrl+A)
- [ ] Copia (Ctrl+C)

#### Paso 1.2 - Ejecutar en Supabase
- [ ] Ve a [supabase.com](https://supabase.com)
- [ ] Abre tu proyecto
- [ ] Click en **SQL Editor** (lado izquierdo)
- [ ] Click en **New Query**
- [ ] Pega el contenido (Ctrl+V)
- [ ] Click en **Run** (botón azul)
- [ ] Espera confirmación ✅

#### Paso 1.3 - Verificar
- [ ] Ejecuta esta consulta:
```sql
SELECT COUNT(*) as bloques FROM encuesta_bloques;
SELECT COUNT(*) as preguntas FROM encuesta_preguntas;
```
- [ ] Deberías ver: `bloques: 5`, `preguntas: 23`

---

### Fase 2: Verificar la App (2 minutos)

#### Paso 2.1 - Inicia sesión
- [ ] Abre tu app
- [ ] Inicia sesión como **Administradora**

#### Paso 2.2 - Accede al panel
- [ ] Ve a `/diagnostico-admin`
- [ ] Deberías ver los 5 bloques listados:
  - [ ] Información Base
  - [ ] Gestión y Finanzas
  - [ ] Marketing y Tecnología
  - [ ] Cultura e Identidad
  - [ ] Participación en Programa

#### Paso 2.3 - Verifica preguntas
- [ ] Click en **"Pregunta"** dentro de un bloque
- [ ] Deberías ver un formulario para crear pregunta
- [ ] Close el diálogo

---

### Fase 3: Probar Funcionalidades (3 minutos)

#### Paso 3.1 - Crear pregunta
- [ ] En `/diagnostico-admin`
- [ ] Click en botón **"Pregunta"** en un bloque
- [ ] Rellena:
  - Pregunta: "¿Esta es una pregunta de prueba?"
  - Tipo: "Opción Múltiple"
  - Opciones: "Opción 1" y "Opción 2" (una por línea)
  - Click en **"Crear"**
- [ ] Deberías ver la pregunta en la lista

#### Paso 3.2 - Editar pregunta
- [ ] Click en icono de lápiz ✏️ en la pregunta que acabas de crear
- [ ] Modifica el texto (agrega "editada" al final)
- [ ] Click en **"Actualizar"**
- [ ] Verifica que el cambio se reflejó

#### Paso 3.3 - Ocultar/Mostrar
- [ ] Click en icono de ojo 👁️
- [ ] La pregunta debe aparecer como "Oculta"
- [ ] Click nuevamente en el ojo
- [ ] Debe volver a "Mostrada"

#### Paso 3.4 - Eliminar
- [ ] Click en icono de papelera 🗑️
- [ ] Confirma el diálogo
- [ ] La pregunta debe desaparecer de la lista

---

### Fase 4: Probar Encuesta (2 minutos)

#### Paso 4.1 - Ir a encuesta
- [ ] Cierra sesión
- [ ] Ve a `/diagnostico`
- [ ] Deberías ver los 5 bloques cargados

#### Paso 4.2 - Responder preguntas
- [ ] Selecciona el primer bloque
- [ ] Responde 2-3 preguntas
- [ ] Click en **"Siguiente"** o navegación

#### Paso 4.3 - Enviar encuesta
- [ ] Completa al menos un bloque
- [ ] Click en **"Enviar Encuesta"**
- [ ] Deberías ver confirmación

#### Paso 4.4 - Verificar en BD
- [ ] Abre Supabase SQL Editor
- [ ] Ejecuta:
```sql
SELECT COUNT(*) as respuestas FROM encuesta_respuestas;
SELECT * FROM encuesta_respuestas LIMIT 1;
```
- [ ] Deberías ver al menos 1 respuesta
- [ ] Verifica que tenga `id_sesion` (NO `user_id`)

---

## 🔧 Troubleshooting

### Problema: Error al ejecutar SQL
**Solución:**
- [ ] Copia TODO el archivo nuevamente
- [ ] Asegúrate de seleccionar TODO (Ctrl+A)
- [ ] Pega línea por línea si es necesario
- [ ] Verifica que sea PostgreSQL

### Problema: No aparecen bloques en admin
**Solución:**
- [ ] Recarga la página (F5)
- [ ] Limpia el cache (Ctrl+Shift+Del)
- [ ] Verifica que ejecutaste el SQL 008 completo
- [ ] Abre consola (F12) y busca errores

### Problema: Error 500 en API
**Solución:**
- [ ] Verifica que los archivos existan en `app/api/admin/survey/`
- [ ] Reinicia la app (si está en dev)
- [ ] Abre consola del navegador (F12) para más detalles

### Problema: Las respuestas no se guardan
**Solución:**
- [ ] Verifica en Supabase que la tabla `encuesta_respuestas` existe
- [ ] Verifica RLS policies en Supabase
- [ ] Abre consola (F12) para ver el error específico

---

## ✨ Validación Final

Una vez completado TODO, verifica estos puntos:

- [ ] ✅ SQL 008 ejecutado en Supabase
- [ ] ✅ 5 bloques visibles en `/diagnostico-admin`
- [ ] ✅ 23 preguntas totales en BD
- [ ] ✅ Puedo crear una pregunta
- [ ] ✅ Puedo editar una pregunta
- [ ] ✅ Puedo ocultar/mostrar preguntas
- [ ] ✅ Puedo eliminar una pregunta
- [ ] ✅ `/diagnostico` carga las preguntas
- [ ] ✅ Puedo responder la encuesta
- [ ] ✅ Las respuestas se guardan en BD con `id_sesion`
- [ ] ✅ NO hay `user_id` en las respuestas (es anónimo)

---

## 📊 Estadísticas Finales

| Item | Estado | Archivo |
|------|--------|---------|
| SQL sin user_id | ✅ | `008_encuesta_anonima_sin_userid.sql` |
| SQL reset | ✅ | `009_reset_encuesta_datos.sql` |
| Componente admin | ✅ | `survey-manager-admin.tsx` |
| API bloques | ✅ | `app/api/admin/survey/bloques/*` |
| API preguntas | ✅ | `app/api/admin/survey/preguntas/*` |
| Página admin | ✅ | `app/diagnostico-admin/page.tsx` |
| Documentación | ✅ | 3 archivos .md |
| Referencia | ✅ | `PREGUNTAS_REFERENCIA.json` |

---

## 🎉 ¡COMPLETADO!

Una vez que todos los items estén marcados como ✅, tu sistema está 100% funcionando.

**No hay más pasos. Todo está listo para usar.**

---

**Fecha de creación:** 2025-06-22  
**Versión:** 2.0 - Encuesta Dinámica Anónima  
**Estado:** ✅ LISTO PARA USAR
