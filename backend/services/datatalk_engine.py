from services.sql_generator import generate_sql
from services.sql_validator import validate_sql
from services.query_executor import execute_query


def ask_datatalk(question, table_name):

    try:
        # STEP 1: Generate SQL
        generated_sql = generate_sql(question, table_name)

        if not generated_sql or not isinstance(generated_sql, str):
            return {
                "success": False,
                "stage": "SQL Generation",
                "message": "SQL generator returned an invalid response.",
                "sql": None,
                "data": None
            }

        # STEP 2: Validate SQL
        validation = validate_sql(
            generated_sql,
            allowed_table=table_name
        )

        if not validation["valid"]:
            return {
                "success": False,
                "stage": "SQL Validation",
                "message": validation["message"],
                "sql": generated_sql,
                "data": None
            }

        safe_sql = validation["sql"]

        # STEP 3: Execute SQL
        execution = execute_query(safe_sql)

        if not execution["success"]:
            return {
                "success": False,
                "stage": "Query Execution",
                "message": execution["message"],
                "sql": safe_sql,
                "data": None
            }

        # STEP 4: Return actual results
        return {
            "success": True,
            "stage": "Completed",
            "message": "DataTalk AI processed your question successfully!",
            "question": question,
            "table_name": table_name,
            "generated_sql": safe_sql,
            "data": execution["data"],
            "row_count": execution["row_count"],
            "columns": execution["columns"]
        }

    except Exception as error:
        return {
            "success": False,
            "stage": "Unexpected Error",
            "message": str(error),
            "sql": None,
            "data": None
        }