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

export function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function toNumberOrNumberArray(
  value: unknown,
): number | number[] | undefined {
  const values = toArray(value)
    .map((item) => toNumber(item))
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
