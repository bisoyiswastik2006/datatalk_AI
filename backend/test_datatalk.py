from services.datatalk_engine import ask_datatalk


questions = [
    "Who scored the highest runs?",
    "Show all players and their teams.",
    "Calculate the average runs scored by players."
]

for question in questions:

    print("\n" + "=" * 55)
    print("QUESTION:", question)

    result = ask_datatalk(question)

    if result["success"]:

        print("\nGENERATED SQL:")
        print(result["generated_sql"])

        print("\nACTUAL DATABASE RESULTS:")
        print(result["data"])

        print("\nTOTAL ROWS:", result["row_count"])

    else:
        print("\nFAILED AT:", result.get("stage"))
        print("ERROR:", result["message"])