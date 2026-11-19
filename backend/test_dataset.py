import pandas as pd
from io import BytesIO
from services.dataset_service import load_dataset

# Create sample CSV data
csv_data = """Player,Runs,Team
Virat Kohli,741,RCB
Rohit Sharma,650,MI
MS Dhoni,500,CSK
"""

# Convert sample data into a file-like object
file = BytesIO(csv_data.encode("utf-8"))
file.name = "test.csv"

# Import dataset into MySQL
result = load_dataset(file, "test_ipl")

print("\nDataset Import Result:")
print(result)