import { NextResponse } from "next/server"
import { deflateRawSync } from "node:zlib"

import { createAdminClient } from "@/lib/supabase/admin"

type ExportQuestion = { column: string; label: string }

const BASE_QUESTIONS: ExportQuestion[] = [
  { column: "parroquia", label: "1. ¿En qué parroquia se encuentra ubicado el emprendimiento?" },
  { column: "sector_ubicacion", label: "2. ¿Cuál es el sector en donde se encuentra ubicado el emprendimiento? Ciudadela/Barrio/Cooperativa" },
  { column: "antiguedad_emprendimiento", label: "3. ¿Cuántos años tiene vigente el emprendimiento?" },
  { column: "sector_economico", label: "4. ¿Cuál es el principal sector económico del emprendimiento?" },
  { column: "ingreso_mensual", label: "5. ¿Cuál es el ingreso mensual aproximado que genera el emprendimiento?" },
  { column: "nivel_instruccion", label: "6. ¿Cuál es su mayor nivel de instrucción formal alcanzado? (nivel educativo de la emprendedora)" },
  { column: "etnia", label: "7. ¿Con que etnia se auto identifica?" },
  { column: "situacion_formalizacion", label: "8. Sobre los papeles de su negocio (permisos de funcionamiento, obtención de RUC, entre otros), ¿cuál es su situación actual?" },
  { column: "control_dinero", label: "9. ¿Lleva algún control o registro del dinero que gana y gasta de su negocio?" },
  { column: "planifica_metas", label: "10. ¿Suele planificar lo que quiere lograr en su negocio cada mes (por ejemplo, cuánto vender o qué productos ofrecer)?" },
  { column: "reinvierte_ganancias", label: "11. ¿Guarda una parte de las ganancias para volver a invertir en su negocio?" },
  { column: "define_precios_costos", label: "12. Al fijar el precio de venta de sus productos o servicios, ¿Usted toma en cuenta lo que le cuesta hacerlo o comprarlo y la ganancia que espera tener?" },
  { column: "promocion_negocio", label: "13. ¿Qué hace normalmente para que más personas conozcan o compren en su negocio?" },
  { column: "medios_promocion", label: "👉 Si marcó la segunda opción, indique las opciones que utiliza con más frecuencia (puede marcar más de una)" },
  { column: "usa_sugerencias_clientes", label: "14. ¿Utiliza las opiniones y sugerencias de sus clientes para hacer mejoras o cambios en sus productos y servicios?" },
  { column: "dispositivo_internet", label: "15. ¿Cuenta con algún dispositivo con acceso a Internet para apoyar la gestión de su negocio?" },
  { column: "dispositivos_usados", label: "👉 Si respondió “Sí” o “A veces”: indique cuál utiliza con mayor frecuencia (puede escoger más de una)" },
  { column: "usa_apps_digitales", label: "16. ¿Acostumbra a utilizar aplicaciones digitales como WhatsApp, Facebook u otros para dar a conocer sus productos y conversar con sus clientes?" },
  { column: "apps_usadas", label: "👉 Si respondió “Sí” o “A veces”: indique cuál utiliza con mayor frecuencia (puede escoger más de una)" },
  { column: "usa_pagos_digitales", label: "17. ¿Acostumbra a usar pagos digitales, como transferencias bancarias o aplicaciones móviles, para cobrar o pagar en su negocio?" },
  { column: "pagos_usados", label: "👉 Si respondió “Sí” o “A veces”: indique cuál utiliza con mayor frecuencia (puede escoger más de una) .1" },
  { column: "dificultad_tecnologia", label: "18. ¿Cuál es la principal dificultad que ha tenido para usar la tecnología en la gestión de su negocio?" },
  { column: "incorpora_cultura", label: "19. ¿Incorpora elementos de su cultura o tradiciones en su negocio (por ejemplo, materiales, diseños, recetas, costumbres o símbolos)?" },
  { column: "elementos_culturales", label: "👉 Si marcó “Sí” o “A veces”, indique cuáles (puede marcar más de una):" },
  { column: "origen_conocimiento_cultural", label: "20. (Solo si marcó “Sí” o “A veces” en la pregunta anterior) ¿De dónde provienen esos conocimientos o prácticas culturales que aplica en su negocio?" },
  { column: "participa_asociaciones", label: "21. ¿Participa en grupos o asociaciones donde comparta su cultura o dé a conocer sus productos tradicionales?" },
  { column: "asociaciones", label: "👉 Si marcó “Sí” o “A veces”, indique en cuáles: (puede marcar mas de una)" },
  { column: "interes_programa", label: "22. ¿Le gustaría participar en el programa de capacitación y formación para emprendedoras que se va a generar con base a la información recolectada en este encuesta, a partir del 2026 y 2027?" },
  { column: "contacto_programa", label: "Si su respuesta fue si, por favor proporcionar un número de WhatsApp activo o correo electrónico que revise a menudo para enviar detalle de programa y enlace de inscripción" },
  { column: "modalidad_preferida", label: "23. En caso de que desee participar, ¿en qué modalidad preferiría recibir las capacitaciones?" },
]
const QUESTIONS: ExportQuestion[] = BASE_QUESTIONS

function escapeXml(value: unknown) {
  const text = Array.isArray(value) ? value.join(" | ") : value === null || value === undefined ? "" : String(value)
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function colName(index: number) {
  let n = index + 1
  let name = ""
  while (n > 0) {
    const rem = (n - 1) % 26
    name = String.fromCharCode(65 + rem) + name
    n = Math.floor((n - 1) / 26)
  }
  return name
}

function crc32(buffer: Buffer) {
  let crc = ~0
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1))
    }
  }
  return (~crc) >>> 0
}

function dateTag(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

function buildZip(entries: { name: string; content: Buffer | string }[]) {
  const fileParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8")
    const contentBuf = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content, "utf8")
    const compressed = deflateRawSync(contentBuf)
    const crc = crc32(contentBuf)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0, 6)
    local.writeUInt16LE(8, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(0, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(contentBuf.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    local.writeUInt16LE(0, 28)

    fileParts.push(local, nameBuf, compressed)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0, 8)
    central.writeUInt16LE(8, 10)
    central.writeUInt16LE(0, 12)
    central.writeUInt16LE(0, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(compressed.length, 20)
    central.writeUInt32LE(contentBuf.length, 24)
    central.writeUInt16LE(nameBuf.length, 28)
    central.writeUInt16LE(0, 30)
    central.writeUInt16LE(0, 32)
    central.writeUInt16LE(0, 34)
    central.writeUInt16LE(0, 36)
    central.writeUInt32LE(0, 38)
    central.writeUInt32LE(offset, 42)
    centralParts.push(central, nameBuf)

    offset += local.length + nameBuf.length + compressed.length
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
  const centralOffset = fileParts.reduce((sum, part) => sum + part.length, 0)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(entries.length, 8)
  eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(centralSize, 12)
  eocd.writeUInt32LE(centralOffset, 16)
  eocd.writeUInt16LE(0, 20)

  return Buffer.concat([...fileParts, ...centralParts, eocd])
}

export async function GET() {
  const supabase = createAdminClient()
  const columns = QUESTIONS.map((question) => question.column)

  const { data, error } = await supabase
    .from("cuestionario_limpio_respuestas")
    .select(columns.join(", "))
    .order("id", { ascending: true })
    .limit(5000)

  const rows = error || !data ? [] : (data as unknown as Record<string, unknown>[])

  const sheetRows: string[] = []
  const headerCells = QUESTIONS
    .map((question, index) => `<c r="${colName(index)}1" t="inlineStr"><is><t xml:space="preserve">${escapeXml(question.label)}</t></is></c>`)
    .join("")
  sheetRows.push(`<row r="1">${headerCells}</row>`)

  rows.forEach((row, rowIndex) => {
    const cells = QUESTIONS
      .map((question, colIndex) => {
        const value = escapeXml(row[question.column])
        return `<c r="${colName(colIndex)}${rowIndex + 2}" t="inlineStr"><is><t xml:space="preserve">${value}</t></is></c>`
      })
      .join("")
    sheetRows.push(`<row r="${rowIndex + 2}">${cells}</row>`)
  })

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData>
    ${sheetRows.join("")}
  </sheetData>
</worksheet>`

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Encuesta" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`

  const xlsxBuffer = buildZip([
    { name: "[Content_Types].xml", content: contentTypes },
    { name: "_rels/.rels", content: rootRels },
    { name: "xl/workbook.xml", content: workbookXml },
    { name: "xl/_rels/workbook.xml.rels", content: workbookRels },
    { name: "xl/worksheets/sheet1.xml", content: sheetXml },
  ])

  return new NextResponse(xlsxBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="encuesta_completa_${dateTag()}.xlsx"`,
    },
  })
}
