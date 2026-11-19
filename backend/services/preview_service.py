from sqlalchemy import inspect, text
from database import engine


def get_table_preview(table_name, limit=10):
    """
    Retrieve a limited preview of rows from a MySQL table.
    """

    try:
        inspector = inspect(engine)

        # Verify that the table exists
        if not inspector.has_table(table_name):
            return {
                "success": False,
                "message": f"Table '{table_name}' does not exist."
            }

        # Validate preview limit
        limit = max(1, min(int(limit), 100))

        # Get column names
        columns = [
            column["name"]
            for column in inspector.get_columns(table_name)
        ]

        # Retrieve total row count and preview data
        with engine.connect() as connection:

            total_rows = connection.execute(
                text(f"SELECT COUNT(*) FROM `{table_name}`")
            ).scalar()

            result = connection.execute(
                text(f"SELECT * FROM `{table_name}` LIMIT :limit"),
                {"limit": limit}
            )

            rows = result.fetchall()

        # Convert database values into JSON-compatible values
        preview_rows = [
            [str(value) if value is not None and not isinstance(
                value, (str, int, float, bool)
            ) else value for value in row]
            for row in rows
        ]

        return {
            "success": True,
            "table_name": table_name,
            "columns": columns,
            "rows": preview_rows,
            "total_rows": total_rows or 0,
            "preview_limit": limit
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error)
        }