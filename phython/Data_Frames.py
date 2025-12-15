import pandas as pd

data = {
    "Name": ['Alice', 'Bob', 'Charlie'],
    "Age": [24, 27, 22],
    "City": ['New York', 'Los Angeles', 'Chicago']
}


df = pd.DataFrame(data)
print("DataFrame created:")
print(df)


print("Column 'Name':")
print(df['Name'])


print("Column 'Name' and 'City' :")
print(df[['Name', 'City']])

filtered_df = df[df['Age'] > 25]
print("Filtered Rows (Age > 25):")
print(filtered_df)