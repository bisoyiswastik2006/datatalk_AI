from services.sql_generator import generate_sql


question = "Who scored the highest runs?"

result = generate_sql(question)

print("\n========== DATATALK AI ==========")

print("Question:", question)

if result["success"]:
    print("\nGenerated SQL:")
    print(result["sql"])
else:
    print("\nError:", result["message"])