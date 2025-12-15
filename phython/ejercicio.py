import random  # importa el módulo random para generar números aleatorios

# pedimos al usuario cuántas veces quiere lanzar el dado
# input() devuelve una cadena; la convertimos a int para usarla como número
guess = int(input("Indicame el numero de veces qu quieres lanzar el dado: "))

def roll_dice(num_rolls):
    # results almacenará cada resultado individual del lanzamiento
    results = []
    # repetimos num_rolls veces; la variable de bucle no se usa, por eso se nombra _
    for i in range(num_rolls):
        # randint(1, 6) devuelve un entero aleatorio entre 1 y 6, ambos inclusive
        roll = random.randint(1, 6)
        # añadimos el valor del lanzamiento a la lista results
        results.append(roll)
    # devolvemos la lista con todos los resultados
    return results

# llamamos a la función con el número leído al inicio
dice_results = roll_dice(guess)

# imprimimos la lista resultante en pantalla
print(f"Resultados de los lanzamientos: {dice_results}")