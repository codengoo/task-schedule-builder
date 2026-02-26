export function toArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function toString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

export function toStringArray(value: unknown): string[] {
  return toArray(value)
    .map((item) => toString(item))
    .filter((item): item is string => item !== undefined);
}

export function toStringOrStringArray(
  value: unknown,
): string | string[] | undefined {
  const values = toStringArray(value);
  if (!values.length) return undefined;
  return values.length === 1 ? values[0] : values;
}

export function toNumber(value: unknown, min?: number, max?: number): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) {
    if ((min !== undefined && value < min) || (max !== undefined && value > max)) throw new Error(`Number value ${value} is out of range [${min}, ${max}]`);
    return value;
  }

  throw new Error(`Invalid number value: ${value}`);
}

export function toNumberOrNumberArray(
  value: unknown,
  min?: number,
  max?: number,
): number | number[] | undefined {
  const values = toArray(value)
    .map((item) => toNumber(item, min, max))
    .filter((item): item is number => item !== undefined);

  if (!values.length) return undefined;
  return values.length === 1 ? values[0] : values;
}

export function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  throw new Error(`Invalid boolean value: ${value}`);
}

export function toEnum<T extends Record<string, string | number>>(
  value: unknown,
  enumType: T,
): T[keyof T] | undefined {
  if (value === undefined) return undefined;
  const enumValues = Object.values(enumType) as Array<T[keyof T]>;
  if (enumValues.includes(value as T[keyof T])) {
    return value as T[keyof T];
  }
  throw new Error(
    `Invalid enum value: ${value}. Expected one of: ${enumValues.join(", ")}`,
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function compactObject<T extends object>(value: T): T {
  const entries = Object.entries(value).filter(
    ([, item]) => item !== undefined,
  );
  return Object.fromEntries(entries) as T;
}

export function toConstants<T extends Record<string, string>>(value: any, allowedKeys: readonly string[]): T | undefined {
  if (!isRecord(value)) return undefined;

  const results: T = {} as T;

  for (const key of allowedKeys) {
    if (key in value) {
      if (value[key] !== "")
        throw new Error(`${key} must be "". Not ${value[key]}`);

      // @ts-ignore
      results[key] = "";
    }
  }

  return Object.keys(results).length ? results : undefined;
}