// Fuente única de verdad del portfolio.
// Añadir un proyecto = añadir un objeto aquí. La UI (filtros, tarjetas,
// contadores y modal de detalle) se construye sola a partir de este array.

// Cada proyecto tiene su propio repositorio publico. El monorepo
// `Analisis_de_datos_IA` los reune todos, pero para enlazar desde aqui
// es mas limpio apuntar al repo individual de cada uno.
const GH = 'https://github.com/danialco9'

export const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'ml', label: 'Machine Learning' },
  { id: 'ia', label: 'IA Generativa' },
  { id: 'dl', label: 'Deep Learning' },
  { id: 'data', label: 'Análisis de Datos' },
  { id: 'sql', label: 'Bases de Datos' },
]

export const PROJECTS = [
  {
    id: 'tfm-lesiones',
    destacado: true,
    titulo: 'Predicción de Riesgo de Lesión Deportiva',
    subtitulo: 'Trabajo Fin de Máster',
    categoria: 'ml',
    periodo: '2026',
    emoji: '🏃',
    resumen:
      'Sistema que estima el riesgo de lesión de deportistas amateurs a partir de su carga de entrenamiento, descanso, sueño y nutrición. Devuelve un score de 0 a 100 con semáforo de riesgo, factores implicados y recomendaciones.',
    descripcion: [
      'El proyecto completo va del dataset crudo a un producto usable: análisis exploratorio, ingeniería de variables, entrenamiento comparado de cuatro modelos y una aplicación Streamlit lista para demo en vivo.',
      'El dataset original (200 atletas universitarios) tenía un desbalance de 13:1 entre lesionados y no lesionados, corregido con SMOTE. Como no incluía datos de sueño ni nutrición, se generaron sintéticamente manteniendo correlaciones lógicas con la fatiga y el rendimiento — una limitación documentada de forma explícita.',
      'La app no muestra la probabilidad cruda del modelo: combina la salida de XGBoost con una capa de interpretación médico-deportiva que pondera combinaciones clínicamente relevantes, como fatiga alta junto a intensidad alta. Además guarda un registro diario que permite analizar la evolución semanal y mensual del deportista, con alertas automáticas y exportación a Excel.',
    ],
    tecnologias: ['Python', 'XGBoost', 'scikit-learn', 'SMOTE', 'Streamlit', 'Plotly', 'pandas'],
    metricas: [
      { valor: '97.3%', etiqueta: 'Accuracy (Random Forest)' },
      { valor: '1.000', etiqueta: 'ROC-AUC' },
      { valor: '23', etiqueta: 'Variables del modelo' },
      { valor: '4', etiqueta: 'Modelos comparados' },
    ],
    tabla: {
      titulo: 'Comparativa de modelos',
      cabeceras: ['Modelo', 'Accuracy', 'ROC-AUC'],
      filas: [
        ['Regresión Logística', '93.3%', '0.997'],
        ['Random Forest', '97.3%', '1.000'],
        ['XGBoost (en producción)', '96.0%', '0.999'],
        ['Ensemble (Voting)', '96.0%', '0.999'],
      ],
    },
    imagenes: [
      { src: 'img/mod_01_comparacion.png', alt: 'Comparativa de métricas entre los cuatro modelos' },
      { src: 'img/mod_03_roc.png', alt: 'Curvas ROC de los modelos entrenados' },
      { src: 'img/mod_04_feature_importance.png', alt: 'Importancia de variables según XGBoost' },
      { src: 'img/mod_02_confusion.png', alt: 'Matriz de confusión del modelo elegido' },
    ],
    aprendizajes:
      'La métrica no lo es todo: un ROC-AUC de 0.999 sobre 200 filas desbalanceadas es una señal de alerta, no un éxito. Lo importante fue construir alrededor del modelo una capa interpretable que un deportista pueda entender y accionar.',
    enlace: `${GH}/proyecto-final`,
  },
  {
    id: 'asistente-gastronomia',
    destacado: true,
    titulo: 'Chef AI — Asistente Experto en Gastronomía',
    subtitulo: 'IA Generativa con RAG y agentes',
    categoria: 'ia',
    periodo: '2026',
    emoji: '🍳',
    resumen:
      'Agente conversacional especializado en gastronomía que fundamenta cada respuesta en una base de conocimiento propia mediante RAG, con memoria de conversación orquestada como un grafo de nodos.',
    descripcion: [
      'El agente combina Gemini 2.5 Flash Lite como modelo de lenguaje, ChromaDB como almacén vectorial y LangGraph para estructurar la lógica en un grafo explícito de dos nodos.',
      'El flujo es: el nodo "recuperar" busca los tres fragmentos más relevantes del corpus y los guarda en el estado; el nodo "generar" los inyecta en el system prompt junto al historial completo y llama al modelo. La memoria se acumula turno a turno, así que el agente entiende preguntas de seguimiento sin repetir contexto.',
      'El corpus cubre cocina española y japonesa, técnicas clásicas francesas, chocolatería, maridaje de vinos y cocina molecular. El system prompt fuerza al modelo a apoyarse en ese contexto y a admitir cuándo no tiene información suficiente, lo que reduce las alucinaciones en un dominio donde los detalles técnicos importan.',
    ],
    tecnologias: ['Gemini 2.5', 'LangGraph', 'ChromaDB', 'LangChain', 'RAG', 'Python'],
    metricas: [
      { valor: 'RAG', etiqueta: 'Respuestas fundamentadas' },
      { valor: '6', etiqueta: 'Documentos en el corpus' },
      { valor: 'k=3', etiqueta: 'Fragmentos recuperados' },
      { valor: '2', etiqueta: 'Nodos en el grafo' },
    ],
    diagrama: [
      { nodo: 'Pregunta', detalle: 'Entrada del usuario' },
      { nodo: 'Recuperar', detalle: 'Búsqueda semántica en ChromaDB' },
      { nodo: 'Generar', detalle: 'Contexto + historial → LLM' },
      { nodo: 'Respuesta', detalle: 'Acumulada en la memoria' },
    ],
    nota: {
      titulo: 'Por qué este proyecto no tiene demo en vivo',
      texto:
        'El agente sí está desplegado: hay una función serverless en Vercel (`api/chef.js` en el repositorio de este portfolio) que reproduce los dos nodos del grafo — embebe la pregunta con gemini-embedding-001, recupera por similitud coseno los 3 documentos más cercanos del corpus y llama a Gemini con el system prompt original. Los embeddings salieron de la propia base ChromaDB del proyecto, sin recalcularlos. La demo pública está desactivada a propósito: mantenerla viva exige una clave de API con cuota real, y cualquier visitante podría agotarla. El código está ahí para quien quiera comprobarlo, y reactivarla es configurar una variable de entorno.',
    },
    aprendizajes:
      'Un buen system prompt vale más que un modelo más grande. Anclar la identidad del agente y obligarle a decir "no lo sé" mejoró la calidad de las respuestas más que cualquier ajuste de temperatura.',
    enlace: `${GH}/asistente-experto`,
  },
  {
    id: 'deep-learning-resenas',
    titulo: 'Análisis de Reseñas con NLP',
    subtitulo: 'Deep Learning aplicado a opinión de clientes',
    categoria: 'dl',
    periodo: '2026',
    emoji: '💬',
    resumen:
      'Pipeline de procesamiento de lenguaje natural sobre reseñas reales de clientes: clasificación de sentimiento con modelos transformer y extracción de los temas recurrentes detrás de las quejas.',
    descripcion: [
      'El análisis parte de un corpus de reseñas de Trustpilot y aplica modelos preentrenados de HuggingFace para clasificar el sentimiento sin necesidad de etiquetar datos manualmente.',
      'Sobre esa base, una factorización NMF con vectorización TF-IDF agrupa las reseñas en temas latentes, lo que permite pasar de "el 40% de las opiniones son negativas" a "el 40% son negativas y estas son las cuatro causas concretas".',
      'El resultado se presentó como informe ejecutivo orientado a negocio, no como análisis técnico: el objetivo era que un responsable de producto pudiera priorizar sin leer una línea de código.',
    ],
    tecnologias: ['HuggingFace', 'Transformers', 'NMF', 'TF-IDF', 'scikit-learn', 'NLP'],
    metricas: [
      { valor: '123k', etiqueta: 'Reseñas en el dataset' },
      { valor: 'Zero-shot', etiqueta: 'Sin etiquetado manual' },
      { valor: 'NMF', etiqueta: 'Modelado de temas' },
    ],
    aprendizajes:
      'Clasificar el sentimiento es la parte fácil y la menos útil. El valor real apareció al agrupar las reseñas negativas por tema: eso es lo que convierte un dato en una decisión.',
    enlace: `${GH}/proyecto-deep-learning`,
  },
  {
    id: 'ml-retail',
    titulo: 'Segmentación y Predicción en Retail',
    subtitulo: 'Machine Learning sobre Online Retail II',
    categoria: 'ml',
    periodo: '2025',
    emoji: '🛒',
    resumen:
      'Análisis exploratorio y modelado predictivo sobre un dataset transaccional real de e-commerce, con pipeline reproducible y validación cruzada estratificada.',
    descripcion: [
      'El dataset Online Retail II recoge transacciones reales de una tienda online británica, con los problemas habituales de los datos de producción: devoluciones en negativo, clientes sin identificar, descripciones inconsistentes y outliers de precio.',
      'El trabajo se estructura en dos notebooks: uno con el EDA básico y otro completo, que añade limpieza justificada, ingeniería de variables y un pipeline de scikit-learn que encapsula escalado y modelo para evitar fugas de información entre entrenamiento y test.',
      'La evaluación usa validación cruzada estratificada en lugar de una partición simple, para que las métricas sean estables pese al desbalance de las clases.',
    ],
    tecnologias: ['scikit-learn', 'Pipeline', 'pandas', 'StratifiedKFold', 'seaborn'],
    metricas: [
      { valor: '2', etiqueta: 'Notebooks (básico y completo)' },
      { valor: 'CV', etiqueta: 'Validación cruzada estratificada' },
      { valor: 'Pipeline', etiqueta: 'Sin fuga de datos' },
    ],
    aprendizajes:
      'Encapsular el escalado dentro del Pipeline en vez de aplicarlo antes del split. Es un detalle que infla las métricas de forma silenciosa y es difícil de detectar después.',
    enlace: `${GH}/proyecto-machine-learning`,
  },
  {
    id: 'estadistica-atletas',
    titulo: 'Inferencia Estadística sobre Lesiones',
    subtitulo: 'Contraste de hipótesis y regresión',
    categoria: 'data',
    periodo: '2025',
    emoji: '📈',
    resumen:
      'Estudio estadístico formal sobre el dataset de atletas universitarios: comprobación de supuestos, contraste de hipótesis, regresión lineal y logística, y descomposición de series temporales.',
    descripcion: [
      'A diferencia de un enfoque puramente predictivo, aquí el objetivo era explicar: qué variables se relacionan de verdad con la lesión y con qué nivel de confianza.',
      'El análisis verifica los supuestos antes de aplicar cada test (normalidad con Shapiro-Wilk, homocedasticidad) en lugar de asumirlos, y usa regresión lineal para las relaciones continuas y logística para la probabilidad de lesión.',
      'Este trabajo fue el germen del Trabajo Fin de Máster: el mismo dataset, pero abordado desde la inferencia en vez de desde la predicción.',
    ],
    tecnologias: ['scipy', 'statsmodels', 'Shapiro-Wilk', 'Regresión', 'pandas'],
    metricas: [
      { valor: '200', etiqueta: 'Atletas analizados' },
      { valor: '17', etiqueta: 'Variables originales' },
      { valor: 'p<0.05', etiqueta: 'Nivel de significación' },
    ],
    imagenes: [
      { src: 'img/eda_03_correlacion.png', alt: 'Matriz de correlación entre variables del dataset' },
      { src: 'img/eda_01_desbalance_clases.png', alt: 'Desbalance de clases en la variable objetivo' },
    ],
    aprendizajes:
      'Comprobar los supuestos antes de aplicar un test cambia las conclusiones. Varias relaciones que parecían claras no resistieron un contraste de normalidad.',
    enlace: `${GH}/proyecto-estadistica`,
  },
  {
    id: 'sql-habitos',
    titulo: 'Plataforma de Hábitos Saludables',
    subtitulo: 'Diseño de base de datos analítica',
    categoria: 'sql',
    periodo: '2025',
    emoji: '🗄️',
    resumen:
      'Modelo relacional en esquema de estrella para analizar los hábitos de jóvenes deportistas, con integridad referencial, restricciones de dominio y consultas orientadas a negocio.',
    descripcion: [
      'El diseño separa una tabla de hechos con el registro diario de hábitos de cinco dimensiones: usuario, deporte, calendario, nivel de entrenamiento y suscripción. Es el patrón estándar para modelos analíticos y hace que las consultas de agregación sean directas.',
      'El esquema no delega la calidad del dato a la aplicación: usa claves foráneas activas, restricciones CHECK sobre los rangos válidos y claves primarias explícitas, de forma que la propia base impide estados incoherentes.',
      'Las consultas del análisis no son ejercicios de sintaxis, sino preguntas de negocio: qué deportes tienen peor descanso medio, dónde hay margen para vender planes de recuperación personalizados.',
    ],
    tecnologias: ['SQLite', 'SQL', 'Esquema en estrella', 'Modelado dimensional'],
    metricas: [
      { valor: '7', etiqueta: 'Tablas del modelo' },
      { valor: '3', etiqueta: 'Scripts (esquema, datos, análisis)' },
      { valor: 'FK', etiqueta: 'Integridad referencial activa' },
    ],
    aprendizajes:
      'Poner las restricciones en el esquema y no en el código. Un CHECK bien puesto evita clases enteras de errores que de otro modo aparecen mucho más tarde.',
    enlace: `${GH}/proyecto-sql`,
  },
  {
    id: 'eda-peliculas',
    titulo: 'Análisis Exploratorio de Películas',
    subtitulo: 'EDA sobre datos de la industria del cine',
    categoria: 'data',
    periodo: '2025',
    emoji: '🎬',
    resumen:
      'Exploración completa de un dataset de películas: evaluación de calidad del dato, limpieza justificada y visualizaciones que sostienen las conclusiones.',
    descripcion: [
      'El proyecto sigue el recorrido clásico de un EDA riguroso: inspección de tipos, detección de nulos, duplicados e inconsistencias, y limpieza documentada decisión a decisión.',
      'Cada visualización responde a una pregunta concreta en lugar de decorar: histograma para la distribución de ventas globales, barras para los distribuidores dominantes y boxplot para comparar la valoración entre géneros.',
    ],
    tecnologias: ['pandas', 'matplotlib', 'Jupyter', 'EDA'],
    metricas: [
      { valor: '3', etiqueta: 'Visualizaciones clave' },
      { valor: '100%', etiqueta: 'Limpieza justificada' },
    ],
    aprendizajes:
      'Documentar por qué se toma cada decisión de limpieza. Un nulo eliminado sin explicación es una conclusión que nadie puede auditar después.',
    enlace: `${GH}/proyecto`,
  },
  {
    id: 'fundamentos-python',
    titulo: 'Fundamentos de Python y pandas',
    subtitulo: 'Base técnica',
    categoria: 'data',
    periodo: '2025',
    emoji: '🐍',
    resumen:
      'Colección de ejercicios sobre estructuras de datos, programación orientada a objetos, manipulación de DataFrames y control de versiones con Git.',
    descripcion: [
      'Trabajo de base sobre el que se apoyan el resto de proyectos: listas y diccionarios, clases y objetos, lectura de CSV, combinación de DataFrames con merge y concat, y flujo de trabajo con Git y GitHub.',
    ],
    tecnologias: ['Python', 'pandas', 'POO', 'Git'],
    metricas: [{ valor: '10+', etiqueta: 'Ejercicios prácticos' }],
    enlace: `${GH}/phython`,
  },
]

export const EXPERIENCIA = [
  {
    puesto: 'Analista de Datos Fiscal',
    empresa: 'Four Stack',
    periodo: 'mar. 2026 — jul. 2026',
    actual: false,
    logros: [
      'Automaticé y reestructuré procesos operativos de atención al cliente con Python y JavaScript, gestionando individualmente unos 100 clientes.',
      'Integré datos tributarios de múltiples fuentes (CSV, Excel y APIs de clientes) para reconstruir operativas de forma estructurada.',
      'Diseñé y adapté modelos y procesos en Python para la clasificación y detección de riesgos fiscales, iterando caso a caso junto al equipo.',
    ],
    impacto: {
      valor: '2-3 días → 1 día',
      etiqueta: 'Tiempo de procesamiento por cliente',
    },
    tecnologias: ['Python', 'JavaScript', 'Excel', 'APIs', 'Automatización'],
  },
  {
    puesto: 'Programador Web',
    empresa: 'Engranajes Ciencia',
    periodo: 'mar. 2025 — jun. 2025',
    actual: false,
    logros: [
      'Desarrollo front-end principal, optimizando la interfaz de usuario para mejorar la experiencia del cliente.',
      'Gestión de ramas de GitHub, asegurando un flujo de trabajo eficiente y colaborativo.',
      'Resolución de errores, aumentando la estabilidad y el rendimiento del software.',
      'Diseño de páginas web, garantizando atractivo visual y funcionalidad.',
    ],
    tecnologias: ['JavaScript', 'Front-end', 'Git', 'GitHub', 'Diseño web'],
  },
]

export const FORMACION = [
  {
    titulo: 'Máster en Data Science & IA',
    centro: 'Evole',
    periodo: '2025 — 2026',
  },
  {
    titulo: 'Máster en Big Data e Inteligencia Artificial',
    centro: 'Medac',
    periodo: '2023 — 2025',
  },
  {
    titulo: 'Grado Superior en Desarrollo de Aplicaciones Web',
    centro: 'Medac',
    periodo: '2023 — 2025',
  },
]

export const IDIOMAS = [
  { idioma: 'Español', nivel: 'Nativo' },
  { idioma: 'Inglés', nivel: 'Nivel medio' },
]

export const SKILLS = [
  {
    area: 'Lenguajes y datos',
    items: ['Python', 'SQL', 'JavaScript', 'pandas', 'NumPy', 'Excel'],
  },
  {
    area: 'Machine Learning',
    items: ['scikit-learn', 'XGBoost', 'SMOTE', 'Pipelines', 'Validación cruzada'],
  },
  {
    area: 'IA y Deep Learning',
    items: ['LangChain', 'LangGraph', 'RAG', 'ChromaDB', 'HuggingFace', 'Gemini'],
  },
  {
    area: 'Visualización y producto',
    items: ['Streamlit', 'Plotly', 'matplotlib', 'seaborn', 'Excel'],
  },
  {
    area: 'Desarrollo web',
    items: ['Front-end', 'JavaScript', 'React', 'Diseño de interfaces'],
  },
  {
    area: 'Herramientas',
    items: ['Git', 'GitHub', 'Jupyter', 'VS Code', 'SQLite'],
  },
]
