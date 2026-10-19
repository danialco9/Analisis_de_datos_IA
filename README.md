# Proyectos del máster de Data Science e IA

Aquí tengo juntos todos los proyectos que hice en el máster de Evolve, y también el código de mi portfolio, que está publicado en [danialco9.vercel.app](https://danialco9.vercel.app).

Cada carpeta es un proyecto:

- `proyecto final`: mi TFM, un modelo para predecir el riesgo de lesión en deportistas.
- `Asistente Experto`: un asistente de cocina con IA generativa que responde usando sus propios documentos.
- `Proyecto_Machine Learning`: análisis de ventas de una tienda online y modelo de recompra.
- `Proyecto_Deep Learning`: análisis de sentimiento de reseñas de Boohoo.
- `Proyecto SQL`: base de datos sobre hábitos de jóvenes deportistas.
- `Proyecto Estadistica`: la práctica de estadística.
- `Proyecto`: análisis exploratorio de un dataset de películas.
- `phython`: ejercicios básicos de Python.
- `portfolio`: la web del portfolio, hecha con React, Vite y Tailwind.

Una cosa de la que estoy contento en el portfolio es que el modelo del TFM funciona directamente en el navegador. Exporté el XGBoost a JSON y lo recorro en JavaScript. Al principio 51 de 400 casos de prueba daban un resultado distinto al de Python, y era porque XGBoost compara en float32 y JavaScript en float64. Lo arreglé redondeando con `Math.fround()` y ahora coinciden los 400. Está explicado en `portfolio/README.md`.

La mayoría de estos proyectos también tienen su propio repositorio en mi perfil.
