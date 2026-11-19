import os
import re

from dotenv import load_dotenv
from groq import Groq

from services.schema_reader import get_table_schema


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing from the .env file")

client = Groq(api_key=GROQ_API_KEY)


def generate_sql(question: str, table_name: str):

    # Validate table name
    if not re.fullmatch(r"[a-zA-Z0-9_]+", table_name):
        raise ValueError("Invalid table name.")

    # Get schema of selected dataset only
    schema = get_table_schema(table_name)

    columns = schema.get("columns", [])

    if not columns:
        raise ValueError("No columns found in the selected dataset.")

    schema_description = "\n".join(
        f"- {column['name']} ({column['type']})"
        for column in columns
    )

    system_prompt = f"""
You are DataTalk AI, an expert MySQL query generator.

Your task is to convert natural-language questions into MySQL SELECT queries.

STRICT RULES:
1. Generate only one MySQL SELECT query.
2. Use only the table `{table_name}`.
3. Use only columns listed in the schema.
4. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or TRUNCATE.
5. Never generate multiple SQL statements.
6. Do not use any other table.
7. Do not include explanations or Markdown code fences.
8. Return only executable SQL.

SELECTED TABLE:
{table_name}

TABLE SCHEMA:
{schema_description}
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": question
            }
        ],
        temperature=0.1,
        max_completion_tokens=2048,
        reasoning_effort="low"
    )

    generated_sql = response.choices[0].message.content

    if not generated_sql:
        raise ValueError("AI did not generate an SQL query.")

    generated_sql = generated_sql.strip()

    # Remove Markdown fences if the model returns them
    generated_sql = re.sub(
        r"^```(?:sql)?\s*|\s*```$",
        "",
        generated_sql,
        flags=re.IGNORECASE
    ).strip()

    return generated_sql