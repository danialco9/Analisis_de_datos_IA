#import math
#import statistics
#
#def caculate_average_and_sqrt(numbers):
#	total = 0
#	for number in numbers:
#		total += number
#	average = statistics.mean(numbers)
#	sqrt = math.sqrt(average)
#	return sqrt
#
#scores = [2, 3, 5, 6]
#result = caculate_average_and_sqrt(scores)
#print(f"The square rootof thr average score is:{result}")


from random import randint

def generate_random_numbers():
	random_number = randint(1, 10)
	print(f"Generated random number: {random_number}") 

generate_random_numbers()