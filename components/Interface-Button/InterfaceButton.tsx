import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { perFormAction } from "@/utils/ChatbotUtility";
import { Button, ButtonProps } from "@mui/material";
import React, { useContext } from "react";
import { MessageContext } from "../Interface-Chatbot/InterfaceChatbot";

interface InterfaceButtonProps {
  props: ButtonProps | any;
  chatbotId: string;
  gridId: string;
  componentId: string;
  inpreview: boolean;
  action?: any;
}
// const urlPattern = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[^\s/$.?#].[^\s]*$/i

function InterfaceButton({ props, action, componentId }: InterfaceButtonProps): JSX.Element {
  delete props?.action;
  const { sendMessage } = useContext(MessageContext);
  const validColors = ["default", "inherit", "primary", "secondary"];
  // If the color is valid, use it; otherwise, default to 'default'
  if (props.color) {
    props.color = validColors.includes(props?.color) ? props?.color : "primary";
  }
  const handleOnClick = () => {
    // if (action?.actionId) {
    perFormAction(action, sendMessage, props);
    // }
  };

  return (
    <Button
      key={`button-${componentId?.id}`}
      variant="contained"
      className="w-100 h-100 mb-1"
      {...props}
      onClick={handleOnClick}
    >
      {props?.label ||
        props?.children ||
        props?.text ||
        props?.title ||
        props?.name ||
        "Button"}
    </Button>
  );
}
export default React.memo(
  addUrlDataHoc(React.memo(InterfaceButton))
);
