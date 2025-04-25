/* eslint-disable */
import { GridContext } from "@/components/Grid/Grid";
import InterfaceAccordion from "@/components/Interface-Accordion/InterfaceAccordion";
import InterfaceBox from "@/components/Interface-Box/InterfaceBox";
import InterfaceButton from "@/components/Interface-Button/InterfaceButton";
import InterfaceMarkdown from "@/components/Interface-Chatbot/Interface-Markdown/InterfaceMarkdown";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { ParamsEnums } from "@/utils/enums";
import React, { useContext } from "react";
import Chatbot from "./Chatbot/Chatbot";
import InterfaceCard from "./Interface-Card/InterfaceCard";
import InterfaceCheckbox from "./Interface-Checkbox/InterfaceCheckbox";
import InterfaceDivider from "./Interface-Divider/InterfaceDivider";
import InterfaceDropdown from "./Interface-DropDown/InterfaceDropdown";
import InterfaceForm from "./Interface-Form/InterfaceForm";
import InterfaceIcon from "./Interface-Icon/InterfaceIcon";
import InterfaceLink from "./Interface-Link/InterfaceLink";
import InterfaceTable from "./Interface-Table/InterfaceTable";
import InterfaceText from "./Interface-Text/InterfaceText";
import InterfaceTextfield from "./Interface-TextField/InterfaceTextfield";
import Interfacedatepicker from "./InterfaceDatepicker/Interfacedatepicker";
import InterfaceRadio from "./InterfaceRadio/InterfaceRadio";


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
  input: (data: any) => <InterfaceTextfield {...data} />,
  textfield: (data: any) => <InterfaceTextfield {...data} />,
  textarea: (data: any) => <InterfaceTextfield {...data} />,
  button: (data: any) => <InterfaceButton {...data} />,
  select: (data: any) => <InterfaceDropdown {...data} />,
  divider: (data: any) => <InterfaceDivider {...data} />,
  text: (data: any) => <InterfaceText {...data} />,
  link: (data: any) => <InterfaceLink {...data} />,
  box: (data: any) => <InterfaceBox {...data} ingrid />,
  checkbox: (data: any) => <InterfaceCheckbox {...data} />,
  form: (data: any) => <InterfaceForm {...data} ingrid />,
  chatbot: (data: any) => <Chatbot {...data} />,
  typography: (data: any) => <InterfaceText {...data} />,
  datepicker: (data: any) => <Interfacedatepicker {...data} />,
  radio: (data: any) => <InterfaceRadio {...data} />,
  icon: (data: any) => <InterfaceIcon {...data} />,
  accordion: (data: any) => <InterfaceAccordion {...data} />,
  table: (data: any) => <InterfaceTable {...data} />,
  markdown: (data: any) => <InterfaceMarkdown {...data} />,
  card: (data: any) => <InterfaceCard {...data} />,
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
  addUrlDataHoc(React.memo(ComponentRenderer), [ParamsEnums?.chatbotId])
);
