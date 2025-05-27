import { Box } from "@mui/material";
import React, { createContext, useMemo } from "react";
import "./Grid.css";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { ParamsEnums } from "@/utils/enums";

const Viewonlygrid = React.lazy(() => import("./Viewonlygrid"));
export const GridContext = createContext({});

function Grid({ componentJson, msgId, ...props }) {
  // Memoize getValueByPath to prevent recreation on each render
  const getValueByPath = useMemo(() => {
    return (path, context) => {
      return path
        ?.replace(/\[(\w+)\]/g, ".$1")
        ?.split(".")
        ?.reduce((acc, part) => acc && acc[part], context);
    };
  }, []);

  // Memoize replaceDynamicPaths to prevent recreation on each render
  const replaceDynamicPaths = useMemo(() => {
    return (obj, context) => {
      if (typeof obj === "string") {
        const dynamicPathRegex = /variables\.[a-zA-Z0-9_.[\]]+/g;
        if (
          obj.match(dynamicPathRegex) &&
          obj.match(dynamicPathRegex).length === 1 &&
          obj.trim() === obj.match(dynamicPathRegex)[0].trim()
        ) {
          return getValueByPath(obj, context);
        }

        return obj.replace(dynamicPathRegex, (match) =>
          String(getValueByPath(match, context))
        );
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => replaceDynamicPaths(item, context));
      }

      if (typeof obj === "object" && obj !== null) {
        return Object.keys(obj || {}).reduce((acc, key) => {
          acc[key] = replaceDynamicPaths(obj[key], context);
          return acc;
        }, {});
      }

      return obj;
    };
  }, [getValueByPath]);

  // Memoize resolvedJson to prevent recalculation on each render
  const resolvedJson = useMemo(() => {
    return replaceDynamicPaths(componentJson, componentJson);
  }, [componentJson, replaceDynamicPaths]);

  const gridContextValue = useMemo(() => {
    return { ...resolvedJson, msgId };
  }, [resolvedJson, msgId]);

  return (
    <GridContext.Provider value={{ gridContextValue, componentJson }}>
      <Box className="h-full w-full">
        <React.Suspense fallback={<div>Loading...</div>}>
          <Viewonlygrid />
        </React.Suspense>
      </Box>
    </GridContext.Provider>
  );
}

// Use React.memo with a custom comparison function
export default React.memo(
  addUrlDataHoc(React.memo(Grid, (prevProps, nextProps) => {
    return (
      prevProps.componentJson === nextProps.componentJson &&
      prevProps.msgId === nextProps.msgId
    );
  }))
);
