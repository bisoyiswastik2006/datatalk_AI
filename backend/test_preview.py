from services.preview_service import get_table_preview


print("\n--- TESTING SALES ORDERS PREVIEW ---")

result = get_table_preview("sales_orders", 5)

print(result)

print("\n--- TESTING IPL PREVIEW ---")

result = get_table_preview("test_ipl", 10)

print(result)