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
# Create a virtual environment
# If `python` is on PATH (Unix or Windows with python on PATH):
python -m venv venv

# On Windows, if the `python` command is not found, use the Python launcher:
py -3 -m venv venv

# Activate the virtual environment
# macOS / Linux:
source venv/bin/activate
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows (cmd.exe):
venv\Scripts\activate

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
