export type SurveyQuestion = {
  id: string
  label: string
  type: "text" | "radio" | "checkbox"
  required?: boolean
  options?: string[]
  placeholder?: string
  visibleWhen?: {
    questionId: string
    values: string[]
  }
}

export type SurveyBlock = {
  id: string
  title: string
  description?: string
  questions: SurveyQuestion[]
}

const yesSometimesNo = ["Si", "A veces", "No"]

export const initialSurveyBlocks: SurveyBlock[] = [
  {
    id: "introduccion",
    title: "Introducción",
    description: "Cuestionario para detectar necesidades de formación y capacitación para mujeres emprendedoras indígenas en la ciudad de Guayaquil",
    questions: [],
  },
  {
    id: "informacion_base_negocio",
    title: "Información base del negocio",
    questions: [
      {
        id: "parroquia",
        label: "1. ¿En qué parroquia se encuentra ubicado el emprendimiento?",
        type: "radio",
        required: true,
        options: ["Tarqui", "Ximena", "Febres Cordero", "Pascuales", "Letamendi", "9 de Octubre", "Ayacucho", "Chongón", "Posorja", "Tenguel", "Otra"],
      },
      {
        id: "parroquia_otro",
        label: "Si seleccionó Otra, especifique la parroquia:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "parroquia", values: ["Otra"] },
      },
      {
        id: "sector_especifico",
        label: "2. ¿Cuál es el sector en donde se encuentra ubicado el emprendimiento? Ciudadela/barrio/cooperativa",
        type: "text",
        required: true,
        placeholder: "Escriba el sector",
      },
      {
        id: "anos_emprendimiento",
        label: "3. ¿Cuántos años tiene vigente el emprendimiento?",
        type: "radio",
        required: true,
        options: ["Menos de 1 año", "1–3 años", "4–6 años", "7 años o más"],
      },
      {
        id: "sector_principal",
        label: "4. ¿Cuál es el principal sector económico del emprendimiento?",
        type: "radio",
        required: true,
        options: ["Artesanías/manualidades", "Textiles/confecciones", "Alimentación/gastronomía", "Comercio (venta de productos)", "Servicios", "Otro"],
      },
      {
        id: "sector_principal_otro",
        label: "Si seleccionó Otro, especifique el sector:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "sector_principal", values: ["Otro"] },
      },
      {
        id: "ingreso_mensual",
        label: "5. ¿Cuál es el ingreso mensual aproximado que genera el emprendimiento?",
        type: "radio",
        required: true,
        options: ["Menos de 200 USD", "200 – 399 USD", "400 – 699 USD", "700 – 999 USD", "1000 USD o más"],
      },
      {
        id: "nivel_instruccion",
        label: "6. ¿Cuál es su mayor nivel de instrucción formal alcanzado?",
        type: "radio",
        required: true,
        options: ["Sin instrucción", "Primaria", "Secundaria", "Técnica/tecnológica", "Universitaria", "Posgrado"],
      },
      {
        id: "etnia_autoidentificacion",
        label: "7. ¿Con que etnia se autoidentifica?",
        type: "radio",
        required: true,
        options: ["Indígena", "Afroecuatoriana", "Mestiza", "Montubia", "Blanca", "Otra"],
      },
      {
        id: "pueblo_nacionalidad",
        label: "Si se autoidentifica como Indígena, especifique su pueblo o nacionalidad:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "etnia_autoidentificacion", values: ["Indígena"] },
      },
      {
        id: "etnia_otro",
        label: "Si seleccionó Otra, especifique su etnia:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "etnia_autoidentificacion", values: ["Otra"] },
      },
    ],
  },
  {
    id: "gestion_finanzas",
    title: "Gestión y Finanzas del Negocio",
    questions: [
      {
        id: "papeles_negocio",
        label: "8. Sobre los papeles de su negocio (permisos de funcionamiento, obtención de RUC, entre otros), ¿cuál es su situación actual?",
        type: "radio",
        required: true,
        options: [
          "Ya estoy formalizado/a al 100% y tengo todos mis documentos en regla.",
          "Estoy en proceso (tengo algunos documentos, pero me faltan o están en trámite).",
          "Aún no me formalizo, porque no sé por dónde empezar ni qué documentos necesito.",
          "Aún no me formalizo, principalmente por la falta de recursos económicos o costos de los trámites.",
          "Aún no me formalizo, porque los procesos me parecen demasiado complejos o largos"
        ],
      },
      {
        id: "lleva_control_dinero",
        label: "9. ¿Lleva algún control o registro del dinero que gana (ingresa) y gasta (sale) de su negocio?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
      },
      {
        id: "planifica_metas",
        label: "10. ¿Suele planificar lo que quiere lograr en su negocio cada mes (por ejemplo, cuánto vender o qué productos ofrecer)?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
      },
      {
        id: "guarda_ganancias",
        label: "11. ¿Guarda una parte de las ganancias para volver a invertir en su negocio?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
      },
      {
        id: "fija_precios",
        label: "12. Al fijar el precio de venta de sus productos o servicios, ¿usted toma en cuenta lo que le cuesta hacerlo o comprarlo y la ganancia que espera tener?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
      },
    ],
  },
  {
    id: "marketing_tecnologia",
    title: "Marketing y tecnología del negocio",
    questions: [
      {
        id: "promociona_negocio",
        label: "13. ¿Qué hace normalmente para que más personas conozcan o compren en su negocio?",
        type: "radio",
        required: true,
        options: [
          "Solo espero que los clientes lleguen a mi local",
          "Busco activamente nuevas formas de promocionar mi negocio (ferias, redes, volantes, etc.)"
        ],
      },
      {
        id: "formas_promocion",
        label: "Si busca activamente promocionar su negocio, indique las opciones que utiliza con más frecuencia:",
        type: "checkbox",
        options: ["Boca a boca (recomendaciones)", "Ferias o mercados", "Volantes o afiches", "Redes sociales (Facebook, WhatsApp, Instagram, etc.)", "Otro"],
        visibleWhen: { questionId: "promociona_negocio", values: ["Busco activamente nuevas formas de promocionar mi negocio (ferias, redes, volantes, etc.)"] },
      },
      {
        id: "formas_promocion_otro",
        label: "Si seleccionó Otro, especifique:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "formas_promocion", values: ["Otro"] },
      },
      {
        id: "usa_opiniones_clientes",
        label: "14. ¿Utiliza las opiniones y sugerencias de sus clientes para hacer mejoras o cambios en sus productos y servicios?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
      },
      {
        id: "dispositivo_internet",
        label: "15. ¿Cuenta con algún dispositivo con acceso a internet para apoyar la gestión de su negocio?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
      },
      {
        id: "tipo_dispositivo",
        label: "Si respondió Sí o A veces, indique cuál utiliza con mayor frecuencia:",
        type: "checkbox",
        options: ["Teléfono celular / smartphone", "Computadora / laptop", "Tablet", "Otro"],
        visibleWhen: { questionId: "dispositivo_internet", values: ["Si", "A veces"] },
      },
      {
        id: "tipo_dispositivo_otro",
        label: "Si seleccionó Otro, especifique:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "tipo_dispositivo", values: ["Otro"] },
      },
      {
        id: "usa_apps_digitales",
        label: "16. ¿Acostumbra a utilizar aplicaciones digitales como WhatsApp, Facebook u otros para dar a conocer sus productos y conversar con sus clientes?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
        visibleWhen: { questionId: "dispositivo_internet", values: ["Si", "A veces"] },
      },
      {
        id: "apps_utilizadas",
        label: "Si respondió Sí o A veces, indique cuáles:",
        type: "checkbox",
        options: ["WhatsApp", "Facebook/Marketplace", "Instagram", "TikTok", "Mercado Libre", "Apps de delivery (PedidosYa, Uber Eats)", "Otro"],
        visibleWhen: { questionId: "usa_apps_digitales", values: ["Si", "A veces"] },
      },
      {
        id: "apps_utilizadas_otro",
        label: "Si seleccionó Otro, especifique:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "apps_utilizadas", values: ["Otro"] },
      },
      {
        id: "usa_pagos_digitales",
        label: "17. ¿Acostumbra a usar pagos digitales, como transferencias bancarias o aplicaciones móviles, para cobrar o pagar en su negocio?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
        visibleWhen: { questionId: "dispositivo_internet", values: ["Si", "A veces"] },
      },
      {
        id: "pagos_digitales",
        label: "Si respondió Sí o A veces, indique cuáles:",
        type: "checkbox",
        options: ["Transferencia bancaria", "PayPhone", "Deuna / botón QR", "Aplicación del banco móvil / banca en línea", "Enlace o botón de pago que envía por redes sociales / WhatsApp", "Otro"],
        visibleWhen: { questionId: "usa_pagos_digitales", values: ["Si", "A veces"] },
      },
      {
        id: "pagos_digitales_otro",
        label: "Si seleccionó Otro, especifique:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "pagos_digitales", values: ["Otro"] },
      },
      {
        id: "dificultad_tecnologia",
        label: "18. ¿Cuál es la principal dificultad que ha tenido para usar la tecnología en la gestión de su negocio?",
        type: "radio",
        required: true,
        options: [
          "No tengo internet o es muy caro",
          "No sé usar bien las aplicaciones",
          "No tengo tiempo para aprender",
          "No tengo quién me enseñe",
          "Otro"
        ],
      },
      {
        id: "dificultad_tecnologia_otro",
        label: "Si seleccionó Otro, especifique:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "dificultad_tecnologia", values: ["Otro"] },
      },
    ],
  },
  {
    id: "cultura_identidad",
    title: "Cultura e identidad del negocio",
    description: "Este bloque se aplica únicamente si usted pertenece a una etnia, pueblo o grupo cultural minoritario",
    questions: [
      {
        id: "incorpora_cultura",
        label: "19. ¿Incorpora elementos de su cultura o tradiciones en su negocio (por ejemplo, materiales, diseños, recetas, costumbres o símbolos)?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
      },
      {
        id: "elementos_culturales",
        label: "Si marcó Sí o A veces, indique cuáles:",
        type: "checkbox",
        options: [
          "Saberes o recetas familiares",
          "Técnicas artesanales o manualidades tradicionales",
          "Materiales o recursos propios de su comunidad",
          "Símbolos, música o formas de vestir culturales",
          "Otro"
        ],
        visibleWhen: { questionId: "incorpora_cultura", values: ["Si", "A veces"] },
      },
      {
        id: "elementos_culturales_otro",
        label: "Si seleccionó Otro, especifique:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "elementos_culturales", values: ["Otro"] },
      },
      {
        id: "origen_conocimientos",
        label: "20. ¿De dónde provienen esos conocimientos o prácticas culturales que aplica en su negocio?",
        type: "radio",
        required: true,
        options: [
          "De mi familia (madre, abuela, tías, etc.)",
          "De personas de mi comunidad o grupo cultural",
          "Los aprendí por mi cuenta observando o practicando",
          "Otro"
        ],
        visibleWhen: { questionId: "incorpora_cultura", values: ["Si", "A veces"] },
      },
      {
        id: "origen_conocimientos_otro",
        label: "Si seleccionó Otro, especifique:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "origen_conocimientos", values: ["Otro"] },
      },
      {
        id: "participa_grupos",
        label: "21. ¿Participa en grupos o asociaciones donde comparta su cultura o dé a conocer sus productos tradicionales?",
        type: "radio",
        required: true,
        options: yesSometimesNo,
      },
      {
        id: "grupos_participa",
        label: "Si marcó Sí o A veces, indique en cuáles:",
        type: "checkbox",
        options: [
          "Asociación o grupo de artesanas",
          "Cooperativa o red de mujeres",
          "Feria cultural o mercado tradicional",
          "Grupo en línea (WhatsApp, Facebook, etc.)",
          "Otro"
        ],
        visibleWhen: { questionId: "participa_grupos", values: ["Si", "A veces"] },
      },
      {
        id: "grupos_participa_otro",
        label: "Si seleccionó Otro, especifique:",
        type: "text",
        placeholder: "Especifique",
        visibleWhen: { questionId: "grupos_participa", values: ["Otro"] },
      },
    ],
  },
  {
    id: "participacion_programa",
    title: "Participación en programa",
    questions: [
      {
        id: "desea_participar",
        label: "22. ¿Le gustaría participar en el programa de capacitación y formación para emprendedoras que se va a generar con base a la información recolectada en esta encuesta, a partir del 2026 y 2027?",
        type: "radio",
        required: true,
        options: ["Sí", "No"],
      },
      {
        id: "contacto",
        label: "Si su respuesta fue sí, por favor proporcionar un número de WhatsApp activo o correo electrónico que revise a menudo:",
        type: "text",
        placeholder: "Teléfono o correo electrónico",
        visibleWhen: { questionId: "desea_participar", values: ["Sí"] },
      },
      {
        id: "modalidad_preferida",
        label: "23. En caso de que desee participar, ¿en qué modalidad preferiría recibir las capacitaciones?",
        type: "radio",
        options: ["Presencial", "Virtual"],
        visibleWhen: { questionId: "desea_participar", values: ["Sí"] },
      },
    ],
  },
]
