import ComponentRenderer from "@/components/ComponentRenderer";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { Box } from "@mui/material";
import React, { useContext } from "react";
import { GridContext } from "./Grid";

function Viewonlygrid({ dragRef }) {
  const { gridContextValue: responseTypeJson }: any = useContext(GridContext);
  const components = responseTypeJson?.components || responseTypeJson;

  return (
    <Box className="w-full" data-testid="chatbot-interface-view-only-grid">
      {(Array.isArray(components) ? components : [])?.map((component: { type: string }, index: number) => {
        return (
          <div key={component?.id || index}>
            <ComponentRenderer
              componentId={component}
              dragRef={dragRef}
              index={index}
              inpreview
            />
          </div>
        );
      })}
    </Box>
  );
}
export default React.memo(
  addUrlDataHoc(React.memo(Viewonlygrid))
);
