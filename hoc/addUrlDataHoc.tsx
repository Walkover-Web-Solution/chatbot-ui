import useTabData from "@/components/Chatbot/hooks/useTabData";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useParams, useSearchParams } from "next/navigation";
import React, { FC } from "react";

export function addUrlDataHoc(WrappedComponent: FC<any>, paramsToInject: string[] = []) {
  return function AddUrlDataHoc(props: any) {
    const params = useParams();
    const searchParams = useSearchParams();
    const data: { [key: string]: string | boolean | undefined } = {};
    const { widgetToken, chatbotId, tabSessionId, isHelloUser } = useCustomSelector((state: any) => ({
      widgetToken: state.tabInfo.widgetToken,
      chatbotId: state.tabInfo.chatbotId,
      tabSessionId: state.tabInfo.tabSessionId,
      isHelloUser: state.tabInfo.isHelloUser,
    }));
    // Set chatSessionId only if it hasn't been set yet
    if (typeof params.chatbotId !== "undefined" && !data.chatSessionId) {
      data.chatSessionId = params.chatbotId === 'hello' ? widgetToken : chatbotId;
    }

    // Only set these values if chatSessionId hasn't been set yet
    if (!data.chatSessionId) {
      if (isHelloUser) {
        data.chatSessionId = typeof widgetToken !== "undefined" ? widgetToken : "";
      } else {
        data.chatSessionId = typeof chatbotId !== "undefined" ? chatbotId : "";
      }
    }
    data.tabSessionId = `${data.chatSessionId}_${tabSessionId}`;
    const tabData = useTabData({ tabSessionId: data.tabSessionId });
    if (data.chatSessionId === "") {
      delete data.chatSessionId;
      delete data.tabSessionId;
    } else {
      if (paramsToInject.length > 0) {
        paramsToInject.forEach((param) => {
          data[param] = tabData[param as keyof typeof tabData];
        });
      }
    }

    return <WrappedComponent {...props} {...data} searchParams={searchParams} />;
  };
}