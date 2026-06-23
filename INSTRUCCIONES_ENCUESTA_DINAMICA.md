# Encuesta Dinámica - Instrucciones de Configuración

## 🚀 Paso 1: Ejecutar el SQL en Supabase

1. Ve a tu proyecto Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo: `scripts/007_encuesta_dinamica_csv.sql`
4. Ejecuta el script

**Resultado esperado:** Verás un mensaje confirmando que las tablas se crearon correctamente (sin errores de `user_id`).

## 📋 Tablas Creadas

- `encuesta_bloques` - Bloques temáticos de la encuesta
- `encuesta_preguntas` - Preguntas dinámicas con tipos y condiciones
- `encuesta_respuestas_csv` - Respuestas de participantes del CSV
- `encuesta_participantes` - Resumen de participantes
- `encuesta_preguntas_auditoria` - Historial de cambios

## 👨‍💼 Paso 2: Acceder como Administradora

Una vez ejecutado el SQL:

1. Inicia sesión como **administradora**
2. Ve a: `/diagnostico-admin`
3. Aquí puedes:
   - ✏️ **Editar preguntas** - Cambiar texto, tipo de respuesta, opciones
   - 👁️ **Mostrar/Ocultar preguntas** - Usar el botón de ojo
   - 🗑️ **Eliminar preguntas** - Remover preguntas innecesarias
   - ➕ **Agregar preguntas** - Crear nuevas preguntas por bloque
   - 🔗 **Condiciones de visibilidad** - Hacer preguntas condicionales (Ej: "¿Tienes empleados?" → si es SÍ, mostrar "¿Cuántos empleados?")

## 👩‍🏫 Paso 3: Encuesta para Emprendedoras

Los cambios en la administración se reflejan automáticamente:

1. Emprendedoras acceden a: `/diagnostico`
2. Ven las preguntas que configuraste
3. Las preguntas ocultadas no aparecen
4. Las condiciones de visibilidad se aplican

## 📊 Estructura de Datos para CSV

Si necesitas importar datos de un CSV manualmente:

```
id_participante | email | nombre | telefono | estado
PART_001        | a@... | ...    | 987...   | borrador
```

Luego importa respuestas con:

```sql
INSERT INTO encuesta_respuestas_csv (id_participante, id_pregunta, respuesta)
VALUES ('PART_001', 'UUID_PREGUNTA_1', 'Respuesta aquí');
```

## 🔧 Gestión de Preguntas

### Tipos de Respuesta Disponibles:
- **Texto** - Respuesta libre
- **Opción Múltiple** - Una sola opción (radio button)
- **Checkbox** - Múltiples opciones
- **Escala** - 1 a 5

### Condiciones de Visibilidad:
Permite mostrar/ocultar preguntas según respuestas anteriores.

**Ejemplo:**
- Pregunta 1: "¿Tienes estrategia de marketing?" → Opciones: [Sí, No]
- Pregunta 2: "¿Cuál es tu presupuesto?" → **Solo visible si responden SÍ**

## 📝 Auditoría

Todos los cambios se registran en `encuesta_preguntas_auditoria`:
- Quién hizo el cambio
- Qué cambió
- Cuándo
- Datos antes y después

## ✅ Checklist de Configuración

- [ ] SQL ejecutado sin errores
- [ ] Acceso a `/diagnostico-admin` como administradora
- [ ] Al menos una pregunta por bloque
- [ ] Preguntas con texto claro
- [ ] Condiciones configuradas (si aplica)
- [ ] Emprendedora puede ver y responder en `/diagnostico`
- [ ] Respuestas se guardan correctamente

## 🆘 Solución de Problemas

### Error: "Column 'user_id' does not exist"
✅ **Resuelto** - El nuevo SQL no requiere `user_id`. Ejecuta el script `007_encuesta_dinamica_csv.sql`

### Las preguntas no aparecen en diagnóstico
- Verifica que `activo = TRUE` en la tabla `encuesta_preguntas`
- Recarga la página (Ctrl+Shift+R)

### Cambios no se reflejan para emprendedoras
- Limpia el cache del navegador
- Verifica los permisos RLS

## 📞 Contacto

Para más información, consulta con el equipo de desarrollo.
