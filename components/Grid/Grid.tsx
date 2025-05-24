import { Box } from "@mui/material";
import React, { createContext, useMemo } from "react";
import "./Grid.css";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { ParamsEnums } from "@/utils/enums";

const Viewonlygrid = React.lazy(() => import("./Viewonlygrid.tsx"));
export const GridContext = createContext({});

function Grid({ componentJson, msgId, ...props }) {
  function getValueByPath(path, context) {
    return path
      ?.replace(/\[(\w+)\]/g, ".$1")
      ?.split(".")
      ?.reduce((acc, part) => acc && acc[part], context);
  }

  function replaceDynamicPaths(obj, context) {
    if (typeof obj === "string") {
      const dynamicPathRegex = /variables\.[a-zA-Z0-9_.[\]]+/g;
      if (
        obj.match(dynamicPathRegex) &&
        obj.match(dynamicPathRegex).length === 1 &&
        obj.trim() === obj.match(dynamicPathRegex)[0].trim()
      ) {
        // If the entire string is a variable path, return the value directly (preserving type)
        return getValueByPath(obj, context);
      }

      // Otherwise, replace inline with strings
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
  }

  const resolvedJson = replaceDynamicPaths(componentJson, componentJson);

  const gridContextValue = useMemo(() => {
    return { ...resolvedJson, msgId };
  }, [componentJson, msgId, resolvedJson]);
  return (
    <GridContext.Provider value={{ gridContextValue, componentJson }}>
      <Box className="h-full w-full">
        <React.Suspense fallback={<div>Loading...</div>}>
          {/* {props?.projectId ? (
            <Editabledgrid {...props} />
          ) : ( */}
          <Viewonlygrid {...props} />
          {/* )} */}
        </React.Suspense>
      </Box>
    </GridContext.Provider>
  );
}

export default React.memo(
  addUrlDataHoc(React.memo(Grid))
);
