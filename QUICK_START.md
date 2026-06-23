# 🚀 QUICK START - Encuesta Dinámica

## El Problema
- ❌ El SQL anterior requería `user_id` (no compatible con CSV)
- ❌ No había forma de editar preguntas sin tocar código
- ❌ La encuesta era estática

## La Solución ✅
Sistema completo de encuesta **dinámica**, **flexible** y **sin dependencias de user_id**.

---

## 📋 Checklist de Configuración (5 minutos)

### ✅ Paso 1: Ejecutar SQL
```
1. Abre Supabase → SQL Editor
2. Copia: scripts/007_encuesta_dinamica_csv.sql
3. Ejecuta
4. ✓ Sin errores
```

### ✅ Paso 2: Acceder como Admin
```
1. Inicia sesión como administradora
2. Ve a: /diagnostico-admin
3. ✓ Ves 5 bloques vacíos
```

### ✅ Paso 3: Crear Preguntas
```
1. Selecciona bloque (Ej: "Información Base")
2. Click "+ Agregar Pregunta"
3. Llena:
   - Texto: "¿En qué parroquia está tu negocio?"
   - Tipo: "Opción Múltiple"
   - Opciones: "Parroquia 1\nParroquia 2\nParroquia 3"
   - Requerida: ✓
4. Click "Crear Pregunta"
5. ✓ Pregunta en la lista
```

### ✅ Paso 4: Emprendedora Responde
```
1. Emprendedora ve /diagnostico
2. Ingresa ID: "PART_001"
3. Responde preguntas que creaste
4. Click "Enviar Encuesta"
5. ✓ Confirmación de envío
```

### ✅ Paso 5: Verificar en BD
```
SELECT * FROM encuesta_respuestas_csv 
WHERE id_participante = 'PART_001';
```

---

## 🎯 Funcionalidades Principales

| Función | Admin | Emprendedora |
|---------|-------|-------------|
| **Ver preguntas** | ✅ | ✅ |
| **Crear preguntas** | ✅ | ❌ |
| **Editar preguntas** | ✅ | ❌ |
| **Mostrar/Ocultar** | ✅ | ❌ |
| **Eliminar preguntas** | ✅ | ❌ |
| **Responder encuesta** | ❌ | ✅ |
| **Ver historial** | ✅ | ❌ |
| **Cambios en tiempo real** | ✅ | ✅ (al recargar) |

---

## 📁 Archivos Clave

### Backend
- `scripts/007_encuesta_dinamica_csv.sql` - Base de datos
- `lib/survey-dynamic-actions.ts` - Server Actions
- `app/diagnostico-admin/page.tsx` - Página admin

### Frontend
- `components/survey/survey-question-manager.tsx` - Panel CRUD
- `components/survey/dynamic-survey-form.tsx` - Encuesta
- `app/diagnostico/page.tsx` - Página actualizada

### Documentación
- `SISTEMA_ENCUESTA_DINAMICA.txt` - Arquitectura visual
- `INSTRUCCIONES_ENCUESTA_DINAMICA.md` - Guía detallada
- `GUIA_IMPORT_CSV.sql` - Import de datos

---

## 🔗 URLs

```
👨‍💼 Administradora
/diagnostico-admin    → Gestionar preguntas

👩‍🏫 Emprendedora
/diagnostico          → Responder encuesta
```

---

## 📊 Estructura de Datos Simple

```
ID Participante (del CSV)
    ↓
Tabla: encuesta_participantes
    ↓
Respuestas guardadas en:
encuesta_respuestas_csv
    ↓
Vinculadas a preguntas dinámicas en:
encuesta_preguntas
```

---

## 🆘 Si Algo Falla

| Problema | Solución |
|----------|----------|
| "Column 'user_id' does not exist" | Ejecuta: `scripts/007_encuesta_dinamica_csv.sql` |
| Las preguntas no aparecen | Verifica: `SELECT * FROM encuesta_preguntas WHERE activo = true` |
| Cambios no aparecen en diagnóstico | Limpia cache: Ctrl+Shift+R |
| Errores en consola | Ve: F12 → Console → Usa el contenido como referencia |

---

## 💡 Ejemplos Rápidos

### Crear una pregunta tipo "Escala 1-5"
```
Texto: "¿Qué tan satisfecho estás?"
Tipo: Escala
Opciones: (automático 1-5)
```

### Crear pregunta con opciones múltiples
```
Texto: "¿Qué sectores te interesan?"
Tipo: Checkbox
Opciones:
- Comercio
- Servicios
- Manufactura
- Agricultura
```

### Hacer pregunta condicional
```
Pregunta A: "¿Tienes empleados?" (Sí/No)
Pregunta B: "¿Cuántos empleados?" → Solo visible si responden "Sí"
```

---

## 📈 Escalabilidad

```
✅ Soporta 1 encuesta con 100+ preguntas
✅ Soporta 1000+ participantes
✅ Cambios en tiempo real
✅ Historial completo de cambios
✅ Respuestas guardadas automáticamente
```

---

## 🎓 Próximas Mejoras (Opcionales)

- [ ] Exportar respuestas a CSV/Excel
- [ ] Gráficos de respuestas en tiempo real
- [ ] Validaciones personalizadas por pregunta
- [ ] Encuestas de seguimiento (segunda ola)
- [ ] Integración con formularios externos
- [ ] Notificaciones por correo

---

## 📞 Soporte

Para más detalles:
1. Lee `SISTEMA_ENCUESTA_DINAMICA.txt` (diagrama completo)
2. Sigue `INSTRUCCIONES_ENCUESTA_DINAMICA.md` (paso a paso)
3. Consulta `GUIA_IMPORT_CSV.sql` (cómo cargar datos)

---

## ✨ ¡Listo!

Tu encuesta dinámica está lista para usar. 

**Próximo paso:** Ejecuta el SQL en Supabase y comienza a crear preguntas.

Happy surveying! 🎉
