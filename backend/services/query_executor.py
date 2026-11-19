import pandas as pd

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from database import engine
from services.sql_validator import validate_sql


def execute_query(query):
    """
    Validate and execute a read-only SQL query.
    Returns actual MySQL results as a Pandas DataFrame.
    """

    try:
        # STEP 1: Validate SQL
        validation = validate_sql(query)

        if not validation["valid"]:
            return {
                "success": False,
                "message": validation["message"],
                "data": None,
                "row_count": 0,
                "columns": []
            }

        safe_query = validation["sql"]

        # STEP 2: Execute SQL in MySQL
        with engine.connect() as connection:

            result = connection.execute(text(safe_query))

            # STEP 3: Fetch actual results
            rows = result.fetchall()
            columns = list(result.keys())

            # STEP 4: Convert into DataFrame
            df = pd.DataFrame(rows, columns=columns)

        return {
            "success": True,
            "message": "Query executed successfully!",
            "data": df,
            "row_count": len(df),
            "columns": columns
        }

    except SQLAlchemyError as error:
        return {
            "success": False,
            "message": f"Database execution failed: {str(error)}",
            "data": None,
            "row_count": 0,
            "columns": []
        }

    except Exception as error:
        return {
            "success": False,
            "message": f"Unexpected error: {str(error)}",
            "data": None,
            "row_count": 0,
            "columns": []
        }