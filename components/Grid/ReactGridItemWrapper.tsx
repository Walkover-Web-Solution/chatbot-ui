import { useLayoutEffect, useRef } from "react";
import useResizeObserver from "../../hooks/ResizeObserverHook.tsx";

export type DimensionType = {
  key: string;
  width: number;
  height: number;
};

export type ReactGridItemWrapperProps = {
  keyName: string;
  onResizeItem: (dimension: DimensionType) => void;
};

function ReactGridItemWrapper({ children, onResizeItem, keyName = "" }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(ref);
  const recalculateDimensions = () => {
    if (ref.current) {
      onResizeItem({
        key: keyName,
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight || ref.current.clientHeight,
      });
    }
  };

  const substringsToCheck = ["TextField", "Typography", "Table", "Form"];
  useLayoutEffect(() => {
    const includesSubstring = substringsToCheck.some((substring) =>
      keyName.includes(substring)
    );
    if (includesSubstring) {
      const timeoutId = setTimeout(() => {
        recalculateDimensions();
        window.addEventListener("resize", recalculateDimensions);
      }, 100); // Adjust the timeout duration as needed

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", recalculateDimensions);
      };
    }
    // Ensure cleanup for cases where the condition doesn't match
    return () => {
      window.removeEventListener("resize", recalculateDimensions);
    };
  }, [keyName, dimensions]); // Ensure effect is re-run if keyName changes

  return (
    <div ref={ref} key={keyName} style={{ height: "fit-content" }}>
      {children}
    </div>
  );
}

export { ReactGridItemWrapper };
