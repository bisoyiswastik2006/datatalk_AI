from services.sql_validator import validate_sql


# Test 1: Valid SELECT query
query1 = """
SELECT player, runs
FROM test_ipl
ORDER BY runs DESC
"""

# Test 2: Dangerous DROP query
query2 = """
DROP TABLE test_ipl
"""

# Test 3: Accessing a non-existing table
query3 = """
SELECT * FROM secret_table
"""

# Test 4: Query with excessive LIMIT
query4 = """
SELECT * FROM test_ipl LIMIT 5000
"""

# Test all queries
test_queries = [
    query1,
    query2,
    query3,
    query4
]

for number, query in enumerate(test_queries, start=1):

    print(f"\nTEST {number}")
    print("Original SQL:", query.strip())

    result = validate_sql(query)

    print("Result:", result)