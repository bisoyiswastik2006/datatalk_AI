import re
import pandas as pd

from database import engine
from sqlalchemy import inspect


def clean_column_names(columns):
    """Convert column names into safe MySQL-compatible identifiers."""

    cleaned = []
    used_names = set()

    for column in columns:
        name = str(column).strip().lower()

        # Replace spaces and special characters with underscores
        name = re.sub(r"[^a-z0-9_]", "_", name)
        name = re.sub(r"_+", "_", name).strip("_")

        if not name:
            name = "column"

        # Prevent column names from starting with a number
        if name[0].isdigit():
            name = "col_" + name

        # Ensure unique column names
        original_name = name
        counter = 1

        while name in used_names:
            name = f"{original_name}_{counter}"
            counter += 1

        used_names.add(name)
        cleaned.append(name)

    return cleaned


def load_dataset(uploaded_file, table_name):
    """
    Read CSV or Excel files and import their contents into MySQL.
    Supports FastAPI UploadFile and regular file-like objects.
    """

    try:
        # Validate table name
        if not re.fullmatch(r"[a-zA-Z][a-zA-Z0-9_]{0,63}", table_name):
            return {
                "success": False,
                "message": "Invalid table name."
            }

        # Get filename (supports FastAPI and regular file objects)
        filename = (
            getattr(uploaded_file, "filename", None)
            or getattr(uploaded_file, "name", None)
        )

        if not filename:
            return {
                "success": False,
                "message": "Unable to identify uploaded file."
            }

        filename = filename.lower()

        # Get actual file stream
        file_data = getattr(uploaded_file, "file", uploaded_file)

        # Read CSV or Excel file
        if filename.endswith(".csv"):
            df = pd.read_csv(file_data)

        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_data)

        else:
            return {
                "success": False,
                "message": "Only CSV and Excel files are supported."
            }

        # Validate dataset
        if df.empty:
            return {
                "success": False,
                "message": "The uploaded dataset is empty."
            }

        if len(df.columns) == 0:
            return {
                "success": False,
                "message": "No columns found in the dataset."
            }

        # Clean column names
        df.columns = clean_column_names(df.columns)

        # Prevent accidental overwriting
        inspector = inspect(engine)

        if inspector.has_table(table_name):
            return {
                "success": False,
                "message": f"Table '{table_name}' already exists."
            }

        # Import dataset into MySQL
        df.to_sql(
            name=table_name,
            con=engine,
            if_exists="fail",
            index=False,
            chunksize=1000
        )

        return {
            "success": True,
            "message": "Dataset imported successfully!",
            "table_name": table_name,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": list(df.columns)
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error)
        }