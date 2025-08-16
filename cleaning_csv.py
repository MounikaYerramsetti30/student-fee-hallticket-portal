import pandas as pd
import sqlite3

# Read file — works for both CSV and Excel
file_path = "FEE DUE LIST 2025-2026 IV TH YEAR.xlsx"  # Change to your actual file
if file_path.endswith(".csv"):
    df = pd.read_csv(file_path)
else:
    df = pd.read_excel(file_path)

# Normalize column names
df.columns = df.columns.str.strip()
df.columns = df.columns.str.replace("\u00A0", " ")  # replace non-breaking spaces

# Now safely convert numeric columns
numeric_cols = ["IV yr I Sem Due", "upto III yr Due"]
for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    else:
        print(f"Warning: Column '{col}' not found in file!")

# Save cleaned CSV
df.to_csv("fees_cleaned.csv", index=False)
print("Cleaned file saved as fees_cleaned.csv")
