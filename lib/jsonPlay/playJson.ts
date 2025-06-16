/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This function converts all properties of an object to strings, including nested objects.
 * Each string is pushed into an array in the format "key: value".
 * @param data - The input object containing properties to be converted.
 * @returns An array of strings representing all properties in "key: value" format.
 */
export const convertPropertiesToKeyArray = (data: any): string[] => {
  const result: string[] = [];
  const traverse = (obj: any, parentKey = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}__${key}` : key;
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        traverse(value, fullKey);
      } else {
        result.push(`${fullKey}`);
      }
    });
  };
  traverse(data);
  return result;
};

export const convertPropertiesToKeyValueArray = (
  data: any
): { key: string; value: unknown }[] => {
  const result: { key: string; value: unknown }[] = [];
  const traverse = (obj: any, parentKey = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}__${key}` : key;
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        traverse(value, fullKey);
      } else {
        result.push({ key: fullKey, value: value });
      }
    });
  };
  traverse(data);
  return result;
};

/**
 * This function searches for a value in an object corresponding to a given key path string.
 * @param data - The input object to search within.
 * @param keyPath - The key path string in dot notation (e.g., "parent.child.key").
 * @returns The value corresponding to the key path, or undefined if not found.
 */
export const findValueByKeyPath = (data: any, keyPath: string): any => {
  const keys = keyPath.split("__");

  // console.log("Keys:", keys);
  let current = data;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
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
  array: { [key: string]: any }[],
  searchKey: string
): TranslationSetType => {
  // console.log(" for key:", key);
  if (searchKey === "")
    return {
      key: "",
      value: "",
      lg: array.find((e) => e.key === "lgKey")?.value,
    };
  const found = array.find((element) => element.key === searchKey);
  return {
    key: found?.key || "",
    value: found?.value || "",
    lg: array.find((e) => e.key === "lgKey")?.value || "",
  };
};

/**
 * Converts a nested object into a tree structure.
 * @param data - The input nested object.
 * @returns A tree representation of the object.
 */

export const convertNestedObjectToTree = (data: Record<string, any>): any[] => {
  const buildTree = (obj: Record<string, any>): any[] => {
    return Object.entries(obj).map(([key, value]) => {
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        return {
          key: key,
          children: buildTree(value),
        };
      }
      return {
        key: key,
        value,
      };
    });
  };

  return buildTree(data);
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
