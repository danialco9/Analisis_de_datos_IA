# Ejercicio Práctico: Carga, Exploración, Limpieza y Visualización Básica de un Dataset

## 1. Objetivo del ejercicio
El propósito de este ejercicio es aprender a realizar un flujo completo y ordenado de análisis exploratorio inicial (EDA) sobre un dataset real. El objetivo no es realizar análisis estadísticos avanzados, sino dominar las fases fundamentales que permiten comprender y describir datos antes de cualquier modelado.

Al finalizar el ejercicio, el alumno deberá ser capaz de:

### 1.1 Exploración
- Identificar la estructura del dataset: dimensiones, columnas, tipos de datos.
- Evaluar la calidad del dataset respondiendo preguntas como:
  - ¿Qué tipos de datos tengo? (numéricos, categóricos, fechas, texto libre...)
  - ¿Cuál es el dominio del dataset? ¿Conozco el contexto de las variables?
  - ¿La fuente de datos es fiable y completa?
  - ¿Los datos están agregados o son individuales (nivel de granularidad)?
  - ¿Hay valores perdidos? ¿Cuál es su proporción?
  - ¿Existen duplicados o registros anómalos?
  - ¿Las variables tienen una distribución razonable? ¿Existen outliers?
  - ¿Los formatos (fechas, categorías) están normalizados?
  - ¿Existen incoherencias entre columnas?

### 1.2 Limpieza
- Corregir tipos de datos.
- Gestionar valores nulos de forma justificada.
- Eliminar o tratar duplicados.
- Normalizar formatos y categorías.
- Corregir incoherencias detectadas.

### 1.3 Visualización básica
Generar visualizaciones sencillas que ayuden a explicar el dataset, respondiendo a preguntas como:
- ¿Cómo se distribuye una variable numérica relevante?
- ¿Cuáles son las categorías más frecuentes?
- ¿Existen diferencias visuales entre grupos?
- ¿Cómo varían los valores a lo largo del tiempo (si aplica)?
- ¿Qué patrones básicos se detectan tras la limpieza?

### 1.4 Documentación y repositorio
- Explicar con claridad el trabajo realizado.
- Organizar un repositorio en GitHub con estructura ordenada.
- Entregar el enlace a través de **Google Classroom**.

---

## 2. Descripción general del ejercicio
El alumno trabajará con un dataset **elegido libremente** de una fuente fiable (Kaggle, datos públicos, open data, repositorios gubernamentales, etc.).

El trabajo consistirá en **cargar los datos, explorarlos, limpiarlos y generar visualizaciones básicas** que permitan entender sus características principales.

El foco está en:
- Calidad del proceso.
- Claridad del análisis.
- Documentación.
- Organización del repositorio.

---

## 3. Tareas obligatorias

### 3.1 Carga del dataset
- Importar el dataset.
- Revisar dimensiones y primeras filas.
- Inspeccionar tipos de datos.

### 3.2 Exploración del dataset
- Valores nulos.
- Duplicados.
- Rango de las variables.
- Incoherencias.
- Distribución inicial de columnas.

### 3.3 Limpieza y normalización
- Corrección de tipos.
- Tratamiento de nulos.
- Eliminación o tratamiento de duplicados.
- Normalización de categorías y fechas.
- Justificación de cada decisión.

### 3.4 Visualizaciones básicas
Debe incluir, como mínimo:
- Un histograma.
  - gráfico de barras que muestra la distribución de frecuencia de una variable numérica, donde cada barra representa un intervalo de valores y su altura indica la cantidad de datos que caen en ese intervalo.
  
- Una gráfica de barras.
- Una visualización adicional que aporte información relevante.(ej. boxplot, línea temporal)

### 3.5 Conclusiones exploratorias
- Resumen claro de las características del dataset.
- Principales hallazgos.
- Cambios aplicados durante la limpieza.

---

## 4. Entregables
La entrega se realizará por **Google Classroom**, incluyendo un enlace a un repositorio público de GitHub.

### 4.1 Estructura mínima del repositorio
```
├── data/
│   └── dataset.csv
├── notebooks/
│   └── eda.ipynb
├── README.md
└── requirements.txt (opcional)
```

### 4.2 Contenido obligatorio
- Notebook completo con el proceso.
- Dataset en la carpeta `data/`.
- README con explicación del análisis.

### 4.3 Criterios de evaluación
- Claridad del análisis.
- Coherencia del proceso de limpieza.
- Calidad de las visualizaciones.
- Orden del repositorio.
- Explicaciones adecuadas.

---

## 5. Recomendaciones
- Comentar el código cuando sea necesario.
- Mantener el notebook limpio y sin celdas duplicadas.
- Evitar análisis avanzados no requeridos.
- Asegurar que las visualizaciones sean legibles y útiles.
- Hacer commits frecuentes.

---

## 6. Entrega
La entrega se realizará exclusivamente por **Google Classroom**, adjuntando el enlace público al repositorio de GitHub.

**Fin del enunciado del ejercicio**