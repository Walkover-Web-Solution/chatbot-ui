import React, { FC } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";

export function addUrlDataHoc(
  WrappedComponent: FC<any>
) {
  return function addUrlDataHoc(props: any) {
    const params = useParams();
    const searchParams = useSearchParams();
    const data: { [key: string]: string | boolean | undefined } = {};
    const { widgetToken, chatbotId } = useCustomSelector((state: any) => ({ widgetToken: state.tabInfo.widgetToken, chatbotId: state.tabInfo.chatbotId }))
    data.chatSessionId = params.chatbotId === 'hello' ? widgetToken : chatbotId
    return (
      <WrappedComponent
        {...props}
        {...data}
        searchParams={searchParams}
      />
    );
  };
}
