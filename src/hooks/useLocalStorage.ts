import { Dispatch, SetStateAction, useEffect, useState } from "react";

type SetValue<T> = Dispatch<SetStateAction<T>>;

const STORAGE_PREFIX_KEY = "bridge_";

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, SetValue<T>] {
  const prefixedKey = `${STORAGE_PREFIX_KEY}${key}`;
  const [value, setValue] = useState(() => {
    let currentValue;

    try {
      currentValue = JSON.parse(
        localStorage.getItem(prefixedKey) || String(defaultValue)
      );
    } catch (error) {
      currentValue = defaultValue;
    }

    return currentValue;
  });

  useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }, [value, prefixedKey]);

  return [value, setValue];
}
