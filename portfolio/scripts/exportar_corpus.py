"""
Extrae los 6 documentos y sus embeddings de la base ChromaDB ya persistida
del Asistente Experto, y los deja en un JSON que consume la funcion serverless.

Se leen del indice existente en vez de recalcularlos, asi que no se gasta
ni una llamada a la API de Gemini.

Uso:
    ../venv/Scripts/python.exe scripts/exportar_corpus.py
"""

import json
import warnings
from pathlib import Path

warnings.filterwarnings('ignore')

import chromadb

CHROMA = Path('C:/Users/dani/Documents/GitHub/Analisis_de_datos_IA/Asistente Experto/chroma_gastronomia')
SALIDA = Path(__file__).resolve().parent.parent / 'api' / 'corpus.json'

cliente = chromadb.PersistentClient(path=str(CHROMA))
coleccion = cliente.get_collection('gastronomia')

datos = coleccion.get(include=['embeddings', 'documents', 'metadatas'])

documentos = []
for texto, meta, emb in zip(datos['documents'], datos['metadatas'], datos['embeddings']):
    documentos.append({
        'texto': texto,
        'meta': meta or {},
        # 6 decimales sobran para una similitud coseno y recortan el archivo
        # a la mitad respecto a la precision completa.
        'embedding': [round(float(v), 6) for v in emb],
    })

SALIDA.parent.mkdir(parents=True, exist_ok=True)
SALIDA.write_text(
    json.dumps({'documentos': documentos}, ensure_ascii=False, separators=(',', ':')),
    encoding='utf-8',
)

print(f'Documentos : {len(documentos)}')
print(f'Dimension  : {len(documentos[0]["embedding"])}')
print(f'Escrito    : {SALIDA} ({SALIDA.stat().st_size / 1024:.0f} KB)')
for d in documentos:
    print(f'  - {d["meta"].get("tema", "?"):20} {d["texto"][:50]}...')
