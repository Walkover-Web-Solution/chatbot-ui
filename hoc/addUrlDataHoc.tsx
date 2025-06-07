import useTabData from "@/components/Chatbot/hooks/useTabData";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useParams, useSearchParams } from "next/navigation";
import { FC } from "react";

export function addUrlDataHoc(WrappedComponent: FC<any>, paramsToInject: string[] = []) {
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

    const tabData = useTabData({ tabSessionId: data.tabSessionId });
    if (paramsToInject.length > 0) {
      paramsToInject.forEach((param) => {
        data[param] = tabData[param as keyof typeof tabData];
      });
    }
    return <WrappedComponent {...props} {...data} searchParams={searchParams} />;
  };
}