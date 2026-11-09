import { SchemaResponse } from '../types/dataset';

/**
 * Derives suggested natural language analytical questions from the active schema.
 * Never hardcodes domain assumptions; dynamically inspects tables, types, and column names.
 */
export function deriveSuggestedQuestions(schema: SchemaResponse | null): string[] {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    return [];
  }

  const questions: string[] = [];
  const primaryTable = schema.tables[0];
  const columns = primaryTable.columns;

  const numericCols = columns.filter(
    (c) =>
      c.type.includes('INT') ||
      c.type.includes('DECIMAL') ||
      c.type.includes('FLOAT') ||
      c.type.includes('NUMERIC') ||
      c.name.toLowerCase().includes('sales') ||
      c.name.toLowerCase().includes('amount') ||
      c.name.toLowerCase().includes('total') ||
      c.name.toLowerCase().includes('revenue') ||
      c.name.toLowerCase().includes('price') ||
      c.name.toLowerCase().includes('quantity')
  );

  const categoricalCols = columns.filter(
    (c) =>
      (c.type.includes('VARCHAR') || c.type.includes('TEXT') || c.type.includes('CHAR')) &&
      !c.name.toLowerCase().includes('id')
  );

  const dateCols = columns.filter(
    (c) =>
      c.type.includes('DATE') ||
      c.type.includes('TIME') ||
      c.name.toLowerCase().includes('date') ||
      c.name.toLowerCase().includes('year')
  );

  if (categoricalCols.length > 0 && numericCols.length > 0) {
    const cat = categoricalCols[0].name.replace(/_/g, ' ');
    const num = numericCols[0].name.replace(/_/g, ' ');
    questions.push(`Which ${cat} drove the highest total ${num}?`);
  }

  if (dateCols.length > 0 && numericCols.length > 0) {
    const date = dateCols[0].name.replace(/_/g, ' ');
    const num = numericCols[0].name.replace(/_/g, ' ');
    questions.push(`Show total ${num} trend over ${date}.`);
  }

  if (categoricalCols.length > 1 && numericCols.length > 0) {
    const cat2 = categoricalCols[1].name.replace(/_/g, ' ');
    const num = numericCols[0].name.replace(/_/g, ' ');
    questions.push(`Compare ${num} breakdown across ${cat2} segments.`);
  }

  if (numericCols.length > 1) {
    const num1 = numericCols[0].name.replace(/_/g, ' ');
    const num2 = numericCols[1].name.replace(/_/g, ' ');
    questions.push(`What is the distribution of ${num1} versus ${num2}?`);
  }

  if (questions.length === 0 && columns.length > 0) {
    questions.push(`Summarize total records in ${primaryTable.name}.`);
    questions.push(`Show sample records grouped by ${columns[0].name}.`);
  }

  return questions.slice(0, 4);
}

