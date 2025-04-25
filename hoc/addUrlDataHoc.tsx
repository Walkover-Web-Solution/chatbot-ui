import React, { FC } from "react";
import { useSearchParams, useParams } from "next/navigation";

export function addUrlDataHoc(
  WrappedComponent: FC<any>,
  paramsToInject?: string[]
) {
  return function addUrlDataHoc(props: any) {
    const params = useParams();
    const searchParams = useSearchParams();
    const data: { [key: string]: string | boolean | undefined } = {};
    
    paramsToInject?.forEach((key: string) => {
      data.chatbotId = params[key] || undefined;
    });

    return (
      <WrappedComponent
        {...props}
        {...data}
        searchParams={searchParams}
      />
    );
  };
}
