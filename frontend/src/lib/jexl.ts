import jexl from "jexl-extended";

// Evaluate JEXL expression safely
export async function evaluateJexl(
  expression: string,
  context: any
): Promise<{ result: any; error: string | null }> {
  try {
    const result = await jexl.eval(expression, context);
    return { result, error: null };
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
