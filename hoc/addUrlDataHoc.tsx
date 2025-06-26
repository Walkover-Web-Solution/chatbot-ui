import useTabData from "@/components/Chatbot/hooks/useTabData";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { useSearchParams } from "next/navigation";
import { FC } from "react";

export function addUrlDataHoc(WrappedComponent: FC<any>, paramsToInject: string[] = []) {
  return function AddUrlDataHoc(props: any) {
    const searchParams = useSearchParams();
    const data: { [key: string]: string | boolean | undefined } = {};
    const { tabSessionId, chatSessionId } = useCustomSelector((state) => ({
      tabSessionId: state.draftData.tabSessionId,
      chatSessionId: state.draftData.chatSessionId
    }));

    data.chatSessionId = chatSessionId;
    data.tabSessionId = `${chatSessionId}_${tabSessionId}`;

    const tabData = useTabData({ tabSessionId: data.tabSessionId });
    if (paramsToInject.length > 0) {
      paramsToInject?.forEach((param) => {
        data[param] = tabData[param as keyof typeof tabData];
      });
    }
    return <WrappedComponent {...props} {...data} searchParams={searchParams} />;
  };
}