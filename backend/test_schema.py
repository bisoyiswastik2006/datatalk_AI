from services.schema_reader import (
    get_table_schema,
    get_all_table_schemas
)

print("\n--- TESTING SINGLE TABLE ---")

result = get_table_schema("test_ipl")
print(result)

print("\n--- TESTING ALL TABLES ---")

all_tables = get_all_table_schemas()
print(all_tables)