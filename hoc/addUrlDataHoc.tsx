import React, { FC } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useCustomSelector } from "@/utils/deepCheckSelector";

export function addUrlDataHoc(WrappedComponent: FC<any>) {
  return function AddUrlDataHoc(props: any) {
    const params = useParams();
    const searchParams = useSearchParams();
    const data: { [key: string]: string | boolean | undefined } = {};
    const { widgetToken, chatbotId, tabSessionId } = useCustomSelector((state: any) => ({
      widgetToken: state.tabInfo.widgetToken,
      chatbotId: state.tabInfo.chatbotId,
      tabSessionId: state.tabInfo.tabSessionId,
    }));

    data.chatSessionId = params.chatbotId === 'hello' ? widgetToken : chatbotId;
    data.tabSessionId = `${data.chatSessionId}_${tabSessionId}`;

    return <WrappedComponent {...props} {...data} searchParams={searchParams} />;
  };
}
