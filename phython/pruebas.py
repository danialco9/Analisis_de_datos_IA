def presentarse (nombre, edad, ciudad, **hobbies):

    string_ = "Me gusta de"

    for key, value in hobbies.items():
        string_ += key
        string_ += ":" + value + ", "

    return f"Hola soy {nombre}, tengo {edad} años y vivo en {ciudad} y mis hobbies son: {string_}"


hobbies_alvaro = {"deporte": "padel", "viajar": "playa"}


presentarse ("Alvaro", 30, "Madrid", **hobbies_alvaro)