from services.query_executor import execute_query


# Test 1: Get all players
query1 = """
SELECT * FROM test_ipl
"""

# Test 2: Find the highest-scoring player
query2 = """
SELECT player, runs
FROM test_ipl
ORDER BY runs DESC
LIMIT 1
"""

# Test 3: Try an unsafe query
query3 = """
DROP TABLE test_ipl
"""


# Run tests
for number, query in enumerate([query1, query2, query3], start=1):

    print(f"\n========== TEST {number} ==========")

    result = execute_query(query)

    print("Message:", result["message"])

    if result["success"]:
        print("Rows:", result["row_count"])
        print(result["data"])