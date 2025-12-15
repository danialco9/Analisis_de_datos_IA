# Example dataset for grouping
#import pandas as pd
#
#sales_data = {
#    # Ajustamos Region para que tenga la misma longitud que Product y Sales (8 elementos)
#    "Region": ["North", "South", "North", "East", "West", "East", "West", "South"],
#    "Product": ["A", "B", "A", "C", "D", "C", "D", "B"],
#    "Sales": [100, 200, 150, 300, 400, 120, 340, 220]
#}
#
#sales_df = pd.DataFrame(sales_data)
#
## Group by Region and calculate total Sales
##grouped = sales_df.groupby("Region")["Sales"].sum()
##print("Total sales by region:")
##print(grouped)
#
## Group by Region and Product, then calculate average Sales
#grouped_product = sales_df.groupby(["Region", "Product"])["Sales"].mean()
#print("Average sales by region and product:")
#print(grouped_product)


import pandas as pd  # Importamos la librería pandas para manejar datos en tablas (DataFrames)

# =======================
# Crear un DataFrame con valores faltantes
# =======================
data_with_nans = {
    "Name": ["Alice", "Bob", "Charlie", "David"],       # Columna con nombres
    "Age": [25, None, 30, 35],                          # Columna con edades, una tiene None (valor faltante)
    "City": ["New York", "Los Angeles", None, "Chicago"]# Columna con ciudades, una tiene None (valor faltante)
}

# Convertimos el diccionario a un DataFrame
nan_df = pd.DataFrame(data_with_nans)

# Mostramos el DataFrame original con valores faltantes
print("Dataset with missing values:")
print(nan_df)

# =======================
# Detectar valores faltantes
# =======================
print("\n¿Hay algún valor faltante?")
print(nan_df.isnull())  # Muestra True donde hay valores faltantes (NaN) y False donde no

# =======================
# Rellenar valores faltantes
# =======================
# Usamos fillna() para reemplazar los valores NaN
# - En "Age": se reemplaza con la media de la columna
# - En "City": se reemplaza con el texto "Unknown"
filled_df = nan_df.fillna({
    "Age": nan_df["Age"].mean(),  # Rellena los NaN de "Age" con el promedio de las edades
    "City": "Unknown"             # Rellena los NaN de "City" con "Unknown"
})

# Mostramos el DataFrame después de rellenar los valores
print("\nDataset after filling missing values:")
print(filled_df)

# =======================
# Eliminar filas con valores faltantes
# =======================
# Usamos dropna() para eliminar las filas que contengan al menos un valor NaN
dropped_df = nan_df.dropna()

# Mostramos el DataFrame después de eliminar las filas incompletas
print("\nDataset after dropping rows with missing values:")
print(dropped_df)
