import re

import sqlglot
from sqlglot import exp

from database import engine


MAX_ROWS = 1000

BLOCKED_FUNCTIONS = {
    "SLEEP",
    "BENCHMARK",
    "LOAD_FILE",
    "GET_LOCK",
    "RELEASE_LOCK"
}


def get_allowed_tables():

    from sqlalchemy import inspect

    inspector = inspect(engine)

    return inspector.get_table_names()


def validate_sql(query: str, allowed_table: str = None):

    if not query or not query.strip():
        return {
            "valid": False,
            "message": "SQL query cannot be empty."
        }

    query = query.strip()

    # Remove trailing semicolon
    query = query.rstrip(";").strip()

    # Reject multiple statements
    if ";" in query:
        return {
            "valid": False,
            "message": "Multiple SQL statements are not allowed."
        }

    try:
        parsed = sqlglot.parse(
            query,
            read="mysql"
        )

        if len(parsed) != 1 or parsed[0] is None:
            return {
                "valid": False,
                "message": "Only one SQL statement is allowed."
            }

        tree = parsed[0]

        # Only SELECT queries are allowed
        if not isinstance(tree, exp.Select):
            return {
                "valid": False,
                "message": "Only SELECT queries are allowed."
            }

        # Reject SELECT INTO
        if tree.find(exp.Into):
            return {
                "valid": False,
                "message": "SELECT INTO is not allowed."
            }

        # Block dangerous functions
        for function in tree.find_all(exp.Func):

            function_name = function.sql_name().upper()

            if function_name in BLOCKED_FUNCTIONS:
                return {
                    "valid": False,
                    "message": f"Function {function_name} is not allowed."
                }

        # Get actual database tables
        database_tables = {
            table.lower()
            for table in get_allowed_tables()
        }

        # Collect referenced physical tables
        referenced_tables = set()

        for table in tree.find_all(exp.Table):

            if table.db or table.catalog:
                return {
                    "valid": False,
                    "message": "Database-qualified table references are not allowed."
                }

            referenced_tables.add(table.name.lower())

        # Check that referenced tables exist
        for table in referenced_tables:

            if table not in database_tables:
                return {
                    "valid": False,
                    "message": f"Table '{table}' does not exist."
                }

        # Restrict query to selected dataset
        if allowed_table:

            if not re.fullmatch(r"[a-zA-Z0-9_]+", allowed_table):
                return {
                    "valid": False,
                    "message": "Invalid selected table name."
                }

            if allowed_table.lower() not in database_tables:
                return {
                    "valid": False,
                    "message": "Selected dataset table does not exist."
                }

            if not referenced_tables:
                return {
                    "valid": False,
                    "message": "Query must reference the selected dataset."
                }

            if referenced_tables != {allowed_table.lower()}:
                return {
                    "valid": False,
                    "message": "Query can only access the selected dataset."
                }

        # Add or limit result count
        limit_expression = tree.args.get("limit")

        if limit_expression is None:

            tree = tree.limit(MAX_ROWS)

        else:

            try:
                current_limit = int(
                    limit_expression.expression.this
                )

                if current_limit > MAX_ROWS:
                    tree = tree.limit(MAX_ROWS)

            except (AttributeError, TypeError, ValueError):
                return {
                    "valid": False,
                    "message": "Invalid LIMIT value."
                }

        safe_sql = tree.sql(dialect="mysql")

        return {
            "valid": True,
            "message": "SQL query validated successfully.",
            "sql": safe_sql
        }

    except Exception as error:

        return {
            "valid": False,
            "message": f"SQL validation failed: {str(error)}"
        }