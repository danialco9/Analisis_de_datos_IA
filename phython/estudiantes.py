import pandas as pd

data = {
    'Nombre': ['Juan', 'Ana', 'Luis', 'María'],
    'Matemáticas': [75, 85, 65, 90],
    'Ciencias': [80, 70, 60, 88],
    'Inglés': [78, 88, 72, 94]
}
df = pd.DataFrame(data)

# Calcular la media de cada estudiante
df['Media'] = df[['Matemáticas', 'Ciencias', 'Inglés']].mean(axis=1)

# Filtrar estudiantes con media superior a 70
aprobados = df[df['Media'] > 70]

# Exportar los datos filtrados
aprobados.to_csv('estudiantes_aprobados.csv', index=False)
print(aprobados)