# Portfolio — Daniel Alconada Diaz

Portfolio web que reune los proyectos del master de Analisis de Datos e IA de este repositorio.

## Arrancar

```bash
cd portfolio
npm install      # solo la primera vez
npm run dev      # http://localhost:5173
```

```bash
npm run build    # genera dist/
npm run preview  # sirve dist/ para comprobarlo antes de publicar
```

## Stack

React 18 + Vite 6 + Tailwind CSS 4. Sin librerias de animacion: las transiciones se hacen
con CSS e `IntersectionObserver`, para no arrastrar dependencias en un sitio estatico.

## Demos en vivo

Dos proyectos se ejecutan de verdad en el navegador, sin servidor detras.

### Prediccion de lesiones (`src/lib/modeloLesiones.js`)

`scripts/exportar_modelo.py` vuelca el XGBoost real del TFM (100 arboles, 23 features) y el
StandardScaler a `src/data/modelo_lesiones.json`. El modulo de JS recorre esos arboles y
reproduce ademas la capa heuristica de `proyecto final/app/app.py`.

**Detalle critico:** XGBoost guarda los umbrales en float32 y compara en float32, mientras
que JavaScript calcula en float64. Sin `Math.fround()` en el valor escalado y en el umbral,
las entradas discretas (enteros y medios puntos) caen justo sobre los cortes y la rama se
decide al reves: 51 de 400 casos daban un score distinto. Con el redondeo a float32, los 400
coinciden.

Para comprobarlo:

```bash
npm run verificar-modelo
```

Compara contra `scripts/casos_referencia.json`, generado con el modelo real de Python.
Si reentrenas el modelo, hay que regenerar ambas cosas:

```bash
../venv/Scripts/python.exe scripts/exportar_modelo.py   # vuelca el modelo a JSON
../venv/Scripts/python.exe scripts/generar_casos.py     # regenera los casos de prueba
npm run verificar-modelo                                # y vuelve a verificar
```

### Consultas SQL (`src/components/DemoSQL.jsx`)

SQLite compilado a WebAssembly (`sql.js`) monta el esquema y los datos reales del proyecto
SQL. El WASM se carga de forma diferida: solo se descarga si el visitante abre esa pestana.

`src/data/sql/*.sql` son **copias** de `Proyecto SQL/`. Si editas los originales, hay que
volver a copiarlos aqui.

### Chef AI (`api/chef.js` + `src/components/DemoChef.jsx`) — DESACTIVADA

> **Esta demo esta implementada y desplegada, pero no aparece en la web.**
>
> Es la unica que no puede funcionar sola en el navegador: necesita llamar a Gemini, y eso
> exige una clave con cuota real que cualquier visitante podria agotar. Se decidio no
> exponerla.
>
> El codigo se conserva entero y funciona: basta con configurar `GEMINI_API_KEY` en Vercel
> y descomentar el `lazy(() => import('./DemoChef'))` y su entrada en el array `DEMOS` de
> `src/components/Demos.jsx`. Son dos lineas.
>
> El endpoint `/api/chef` sigue desplegado; sin la variable responde con un aviso claro de
> que falta la clave, en vez de romperse.

Es la unica demo que **no** funciona sola en el navegador: necesita llamar a Gemini, y la
clave no puede viajar al cliente. Por eso hay una funcion serverless que hace de
intermediaria. La clave vive en Vercel y nunca sale del servidor.

La funcion reproduce los dos nodos del grafo de LangGraph del notebook:

1. **recuperar** — embebe la pregunta con `gemini-embedding-001` y saca por similitud
   coseno los 3 documentos mas cercanos de `api/corpus.json`.
2. **generar** — inyecta ese contexto en el mismo system prompt del notebook, junto al
   historial, y llama a `gemini-2.5-flash-lite`.

`api/corpus.json` se genera con `scripts/exportar_corpus.py`, que lee los embeddings ya
calculados de la base ChromaDB del proyecto. **No gasta llamadas a la API.** Los vectores
de Gemini vienen normalizados, asi que ordenar por coseno da el mismo ranking que la
distancia L2 que usaba Chroma.

La respuesta incluye que documentos se usaron y con que similitud, y la interfaz los
muestra: el RAG se ve trabajando en vez de ser una caja negra.

**Limites de uso.** Cada pregunta gasta dos peticiones de la cuota gratuita (15/minuto,
1000/dia). La funcion limita a 10 preguntas por IP cada 10 minutos y 300 al dia. Es un
control **aproximado**: sin base de datos, cada instancia de la funcion lleva su propia
cuenta y Vercel puede levantar varias a la vez. Frena el abuso casual, no un ataque serio.
Si algun dia hace falta algo solido, la pieza que falta es Vercel KV.

## Desplegar en Vercel

El portfolio esta dentro de un monorepo, asi que hay que indicarle a Vercel donde mirar.

1. Sube los cambios a GitHub.
2. En Vercel: **Add New → Project** e importa el repo `Analisis_de_datos_IA`.
3. **Root Directory: `portfolio`** ← este es el paso que se olvida y hace fallar el build.
4. Framework: Vite (lo detecta solo).
5. **Settings → Environment Variables**: anade `GEMINI_API_KEY` con tu clave real.
6. Deploy.

Sin el paso 5 todo el sitio funciona menos el Chef AI, que devolvera un aviso de que el
servidor no tiene la clave configurada.

### Probarlo en local

`npm run dev` levanta la web pero **no** las funciones de `api/`, asi que el Chef AI
mostrara un aviso explicando que necesita el despliegue. Para probarlo entero en local:

```bash
npm i -g vercel
cp .env.example .env    # y pon tu clave dentro
vercel dev
```

## Como anadir o editar un proyecto

Todo el contenido vive en un unico archivo: **`src/data/projects.js`**. No hay que tocar
ningun componente. Anadir un objeto al array `PROJECTS` actualiza sola la rejilla, los
filtros, los contadores y el modal de detalle.

Campos de un proyecto:

| Campo | Obligatorio | Que hace |
|---|---|---|
| `id` | si | Identificador unico |
| `titulo`, `subtitulo`, `emoji`, `periodo` | si | Cabecera de la tarjeta |
| `categoria` | si | Debe existir en `CATEGORIES` para que el filtro lo recoja |
| `resumen` | si | Texto de la tarjeta |
| `tecnologias` | si | Etiquetas; alimentan tambien el buscador |
| `destacado` | no | La tarjeta ocupa doble ancho y muestra metricas |
| `descripcion` | no | Array de parrafos del modal |
| `metricas` | no | Cifras destacadas |
| `tabla` | no | Tabla de resultados en el modal |
| `imagenes` | no | Rutas relativas a `public/` |
| `diagrama` | no | Diagrama de flujo por pasos |
| `aprendizajes` | no | Cita de cierre del modal |
| `enlace` | si | URL al codigo en GitHub |

## Imagenes

Las graficas de `public/img/` son **copias** de `proyecto final/data/processed/`. Si
reejecutas los notebooks y quieres las nuevas, hay que volver a copiarlas.

## Contenido

Ademas de `PROJECTS`, el archivo `src/data/projects.js` exporta `EXPERIENCIA`, `FORMACION`,
`IDIOMAS` y `SKILLS`, que alimentan las secciones de trayectoria y stack. Los datos salen
del CV.

## Pendiente antes de publicar

- **Confirmar la URL de LinkedIn** en `src/components/Contact.jsx`: en el CV aparece escrita
  de dos formas distintas (`daniel-alconada-diaz` y `danielalconada-díaz`). Esta puesta la
  primera.
- El telefono es publico por decision expresa. Si en algun momento llega spam, se quita de
  `CONTACTO` en `src/components/Contact.jsx`.
- Revisar el texto de `src/components/About.jsx`: esta redactado en primera persona a partir
  del CV y del repositorio, conviene ajustarlo a como te quieras presentar.

## Desplegar

`npm run build` genera `dist/`, que es HTML/CSS/JS estatico y se puede subir a cualquier
hosting. `base: './'` en `vite.config.js` usa rutas relativas, asi que funciona tanto en la
raiz de un dominio como dentro de un subdirectorio (por ejemplo GitHub Pages de un repo).
