/* eslint-disable */
import { GridContext } from "@/components/Grid/Grid";
import InterfaceMarkdown from "@/components/Interface-Chatbot/Interface-Markdown/InterfaceMarkdown";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import React, { useContext } from "react";
import Chatbot from "./Chatbot/Chatbot";

interface ComponentRendererProps {
  gridId?: string;
  componentId: string;
  dragRef?: any;
  inpreview?: boolean;
  chatbotId: string;
  index: number;
}
ComponentRenderer.defaultProps = {
  id: "",
  gridId: "root",
  dragRef: {},
  inpreview: false,
};

const componentMap: any = {
  chatbot: (data: any) => <Chatbot {...data} />,
  markdown: (data: any) => <InterfaceMarkdown {...data} />,
};

function ComponentRenderer({
  // gridId,
  componentId,
  dragRef,
  inpreview = false,
  index,
}: ComponentRendererProps) {
  const { gridContextValue: responseTypeJson, componentJson }: any =
    useContext(GridContext);
  const type = (
    responseTypeJson?.components?.[index]?.type ||
    responseTypeJson?.[index]?.type
  )?.toLowerCase();
  const propsPath = componentJson?.components?.[index]?.props;
  const props =
    responseTypeJson?.components?.[index]?.props ||
    responseTypeJson?.[index]?.props;
  const meta =
    responseTypeJson?.components?.[index]?.meta ||
    responseTypeJson?.[index]?.meta;
  const action =
    responseTypeJson?.components?.[index]?.action ||
    responseTypeJson?.[index]?.action;

  const component = componentMap[type] || null;

  if ((component && type === "Button") || type === "ChatBot") {
    return component({
      props,
      componentId,
      inpreview,
      action,
      meta,
      propsPath,
    });
  }

  return component
    ? component({
      props,
      componentId,
      inpreview,
      dragRef,
      action,
      meta,
      propsPath,
    })
    : null;
}

export default React.memo(
  addUrlDataHoc(ComponentRenderer)
);
