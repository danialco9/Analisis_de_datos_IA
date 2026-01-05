import pandas as pd


df = pd.DataFrame([{"val1": "Alvaro Gonzalez Garcia"}, {"val1": "Laura  Gonzalez Garcia"}, {"val1": "Oscar Martinez Garcia"}])

df["Nombre"], df["Apellido 1"] , df["Apellido2"] =df["val1"].apply(lambda x: x.split())

ej = "Alvaro Gonzalez Garcia"
ej.split()