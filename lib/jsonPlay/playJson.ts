/**
 * This function converts all properties of an object to strings, including nested objects.
 * Each string is pushed into an array in the format "key: value".
 * @param data - The input object containing properties to be converted.
 * @returns An array of strings representing all properties in "key: value" format.
 */
export const convertPropertiesToKeyArray = (
  data: Record<string, unknown>
): string[] => {
  const result: string[] = [];
  const traverse = (obj: Record<string, unknown>, parentKey = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}__${key}` : key;
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        traverse(value as Record<string, unknown>, fullKey);
      } else {
        result.push(`${fullKey}`);
      }
    });
  };
  traverse(data);
  return result;
};

export const convertPropertiesToKeyValueArray = (
  data: Record<string, unknown>
): { key: string; value: unknown }[] => {
  const result: { key: string; value: unknown }[] = [];
  const traverse = (obj: Record<string, unknown>, parentKey = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}__${key}` : key;
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        traverse(value as Record<string, unknown>, fullKey);
      } else {
        result.push({ key: fullKey, value: value });
      }
    });
  };
  traverse(data);
  return result;
};

export type TranslationSetType = {
  key: string;
  value: string;
  lg: string;
};

/**
 * This function searches for an element in an array of objects based on a given key.
 * @param array - The array of objects to search within.
 * @param key - The key to match in the objects.
 * @returns The first object that contains the given key, or undefined if not found.
 */
export const findElementByKeyPresence = (
  array: { key: string; value: string; lg?: string }[],
  searchKey: string
): TranslationSetType => {
  // console.log(" for key:", key);
  if (searchKey === "")
    return {
      key: "",
      value: "",
      lg: array.find((e) => e.key === "lgKey")?.value || "",
    };
  const found = array.find((element) => element.key === searchKey);
  return {
    key: found?.key || "",
    value: found?.value || "",
    lg: array.find((e) => e.key === "lgKey")?.value || "",
  };
};

export const obj = {
  l1: {
    l2: "value",
  },
  a1: {
    a2: {
      a3: "value",
      a4: {
        a5: "value",
      },
    },
  },
  b: "value",
};
