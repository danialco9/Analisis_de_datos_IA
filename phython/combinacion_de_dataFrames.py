import pandas as pd  # Importamos pandas para trabajar con DataFrames

# =======================
# Crear DataFrames de ejemplo
# =======================

# Primer conjunto de datos (DataFrame de la izquierda)
left_data = {
    "ID": [1, 2, 3],                         # Columna ID con identificadores únicos
    "Name": ["Alice", "Bob", "Charlie"]       # Columna con nombres
}

# Segundo conjunto de datos (DataFrame de la derecha)
right_data = {
    "ID": [3, 4, 5],                          # Columna ID, algunos valores coinciden con el primer DataFrame
    "Score": [85, 90, 95]                     # Columna con puntuaciones
}

# Convertimos los diccionarios en DataFrames
left_df = pd.DataFrame(left_data)
right_df = pd.DataFrame(right_data)

# =======================
# Unir los DataFrames
# =======================
# Usamos pd.merge() para combinar ambos DataFrames según la columna "ID"
# - on="ID" indica la columna común por la que se unen los datos
# - how="inner" indica el tipo de unión (solo los IDs que existen en ambos)
merged_df = pd.merge(left_df, right_df, on="ID", how="inner")

# =======================
# Mostrar el resultado
# =======================
print("Merged DataFrame:")
print(merged_df)

# =======================
# Unión externa (outer join)
# =======================

# Usamos how="outer" para combinar todos los registros de ambos DataFrames
outer_join_df = pd.merge(left_df, right_df, on="ID", how="outer")

# Mostramos el resultado de la unión externa
print("Outer Join result:") 
print(outer_join_df)
