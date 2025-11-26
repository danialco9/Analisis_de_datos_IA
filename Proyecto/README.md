# Proyecto EDA - Videojuegos

Repositorio de ejemplo para el ejercicio práctico de EDA (Exploración, limpieza y visualización)
sobre un dataset de videojuegos.

## Estructura
```
├── data/
│   └── videogames_dataset.csv
├── notebooks/
│   └── eda.ipynb
├── README.md
└── requirements.txt
```

## Contenido
- `data/videogames_dataset.csv`: dataset utilizado (ventas estimadas en millones y notas).
- `notebooks/eda.ipynb`: notebook con el proceso de carga, exploración, limpieza y visualizaciones.
- `requirements.txt`: dependencias recomendadas.

## Cómo ejecutar
1. Clona el repositorio o descarga los archivos.
2. (Opcional) Crea un entorno virtual e instala dependencias:
```bash
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
```
3. Abre el notebook:
```bash
jupyter notebook notebooks/eda.ipynb
```

## Resumen del notebook
El notebook realiza:
- Carga y vista inicial del dataset.
- Inspección de tipos, nulos y duplicados.
- Limpieza básica (tipos, tratamiento de nulos si aplica).
- Visualizaciones: histograma (Sales_Global), gráfica de barras (Top publishers), boxplot (Rating por género).
- Conclusiones exploratorias al final.

---
Generado automáticamente por ChatGPT.
