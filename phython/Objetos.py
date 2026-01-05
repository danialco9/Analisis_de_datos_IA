#class Car:
#    def __init__(self, make, model, year, odometer_reading=0):
#        self.make = make
#        self.model = model
#        self.year = year
#        self.odometer_reading = odometer_reading
#
#    def get_descriptive_name(self):
#        long_name = f"{self.make} {self.model} {self.year}"
#        return long_name.title()
#    
#    def read_odometer(self):
#        print(f"This car has {self.odometer_reading} miles on it.")
#
#first_car = Car('audi', 'a4', 2019, 15000)
#second_car = Car('toyota', 'corolla', 2020)
#
#print(first_car.get_descriptive_name())
#first_car.read_odometer()
#print(second_car.get_descriptive_name())
#second_car.read_odometer()
#
#
#
class Car1:
    def __init__(self, color, year, puertas):
        self.color = color
        self.year = year
        self.puertas = puertas

    def unanyomas(self):
        self.year += 1
        return self.year
    def nuevo_atributo(self, valor):
        self.nuevo = valor
    
coche_elisabeth = Car1('rojo', 2018, 4)
coche_elisabeth.unanyomas()
print(f"El coche de Elisabeth es de color {coche_elisabeth.color} y tiene {coche_elisabeth.puertas} puertas y es del año {coche_elisabeth.year}.")
coche_elisabeth.nuevo_atributo('hola')
coche_elisabeth.nuevo

import datetime
este_año = datetime.datetime.now().year
este_año

class Car2():
    def __init__(self, n_puertas=4):
        self.este_año = datetime.datetime.now().year  
        self.n_puertas = n_puertas

elizabeth = Car2()
elizabeth.este_año = 2024
elizabeth.n_puertas

#class Car():
#    def __init__(self, velocity=0):
#        self.velocity = velocity
#
#coche_enric = Car()
#
#print("Atributos públicos de Car:", [i for i in dir(Car) if "_" not in i])
#print("Atributos públicos de coche_enric:", [i for i in dir(coche_enric) if "_" not in i])

class Staff ():

    def __init__(self, nombre, apellido, ciudad, vacaciones=22):
        self.nombre = nombre
        self.apellido = apellido
        self.ciudad = ciudad
        self.vacaciones = vacaciones

        self.email = f"{nombre.lower()}.{apellido.lower()}@company.com"


    def nombre(self,):
        self.self.nombre


    def saludo(self):
        return f"Hola, mi nombre es {self.nombre} {self.apellido} y vivo en {self.ciudad}."
    
    def coger_vacaciones(self, dias = 1):
        if dias < 0:
            raise Exception("no puedes coger días negativos")

        if self.vacaciones - dias >= 0:
            self.vacaciones -= dias
            return f"Te quedan {self.vacaciones} días de vacaciones."
        else:
            return f"No puedes coger {dias} de vacaciones porque te quedan{self.vacaciones}."

empleado1 = Staff("Luis", "Gonzalez", "Madrid")
empleado1
empleado1.coger_vacaciones(5)


class Marketing(Staff):
    pass

carlos = Marketing("carlos", "lopez", "barcelona")
carlos.nombre
carlos.coger_vacaciones(3)
carlos.email
carlos.saludo()