class Car:
    def __init__(self, make, model, year, odometer_reading=0):
        self.make = make
        self.model = model
        self.year = year
        self.odometer_reading = odometer_reading

    def get_descriptive_name(self):
        long_name = f"{self.make} {self.model} {self.year}"
        return long_name.title()
    
    def read_odometer(self):
        print(f"This car has {self.odometer_reading} miles on it.")

first_car = Car('audi', 'a4', 2019, 15000)
second_car = Car('toyota', 'corolla', 2020)

print(first_car.get_descriptive_name())
first_car.read_odometer()
print(second_car.get_descriptive_name())
second_car.read_odometer()