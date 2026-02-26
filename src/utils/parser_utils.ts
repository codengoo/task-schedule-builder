import { DeepPartial } from "../types";

export function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target } as T;
  for (const key in source) {
    const sourceVal = (source as Record<string, unknown>)[key];
    const targetVal = (target as Record<string, unknown>)[key];
    if (sourceVal !== undefined) {
      if (
        typeof sourceVal === "object" &&
        !Array.isArray(sourceVal) &&
        sourceVal !== null &&
        typeof targetVal === "object" &&
        targetVal !== null
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          targetVal as object,
          sourceVal as DeepPartial<object>
        );
      } else {
        (result as Record<string, unknown>)[key] = sourceVal;
      }
    }
  }
  return result;
}
