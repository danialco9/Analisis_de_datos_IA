#df =.pd.read_csv('data.csv')
#print("CSV file read into DataFrame:")
#df.head()  # Display the first few rows of the DataFrame

import seaborn as sns
import pandas as pd

iris = sns.load_dataset('iris')

print("First few rows of the Iris dataset (head):")
print(iris.head())

print("\nSummary statistics (describe):")
print(iris.describe())


print("\nDatabase informacion (info):")
print(iris.info()) 


iris_df.to_csv('iris_output.csv', index=False)
print("\nIris dataset saved to 'iris_output.csv'")