from sqlalchemy import inspect, text
from database import engine


def get_table_schema(table_name):
    """
    Get detailed schema information for a MySQL table.
    """

    try:
        inspector = inspect(engine)

        if not inspector.has_table(table_name):
            return {
                "success": False,
                "message": f"Table '{table_name}' does not exist."
            }

        columns = inspector.get_columns(table_name)

        # Get total row count
        with engine.connect() as connection:
            row_count = connection.execute(
                text(f"SELECT COUNT(*) FROM `{table_name}`")
            ).scalar()

        schema = []

        for column in columns:
            schema.append({
                "name": column["name"],
                "type": str(column["type"]),
                "nullable": column["nullable"],
                "null_count": 0,
                "null_percentage": 0,
                "distinct_count": None,
                "sample_values": []
            })

        return {
            "success": True,
            "name": table_name,
            "row_count": row_count or 0,
            "column_count": len(columns),
            "columns": schema
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error)
        }


def get_all_table_schemas():
    """
    Get schema information for all MySQL tables.
    """

    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()

        all_schemas = []

        for table_name in table_names:
            result = get_table_schema(table_name)

            if result["success"]:
                all_schemas.append({
                    "name": result["name"],
                    "row_count": result["row_count"],
                    "column_count": result["column_count"],
                    "columns": result["columns"]
                })

        return {
            "success": True,
            "tables": all_schemas
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error)
        }