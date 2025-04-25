import { useSelector } from "react-redux";

export default function isEqual(oldValue, newValue) {
  if (oldValue === newValue) return true;

  if (
    oldValue === null ||
    oldValue === undefined ||
    newValue === null ||
    newValue === undefined
  ) {
    return false;
  }

  const typeOfOldValue = typeof oldValue;
  const typeOfNewValue = typeof newValue;

  if (typeOfOldValue !== typeOfNewValue) return false;

  if (typeOfOldValue === "object") {
    const keys1 = Object.keys(oldValue);
    const keys2 = Object.keys(newValue);

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => isEqual(oldValue[key], newValue[key]));
  }

  if (Array.isArray(oldValue)) {
    if (!Array.isArray(newValue) || oldValue.length !== newValue.length)
      return false;

    return oldValue.every((item, index) => isEqual(item, newValue[index]));
  }

  return false;
}
export const useCustomSelector = (stateChangesKaFuntion) => {
  const data = useSelector(stateChangesKaFuntion, isEqual);
  return data;
};
