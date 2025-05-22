'use client'
import { usePathname } from "next/navigation";
import { getAgentDetailsApi } from '@/config/api';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from "react-redux";
import { addDefaultContext, setThreadId } from "@/store/interface/interfaceSlice";
import { setDataInAppInfoReducer } from "@/store/appInfo/appInfoSlice";

export default function Home({children}: {children: React.ReactNode}) {
  const path = usePathname();
  const pathArray = path.split('/');
  const agent_name = pathArray[pathArray.length - 1];
  const dispatch = useDispatch();

  const fetchAgentDetails = useCallback(async (agent_name: string) => {
    try {
      const getDetails = await getAgentDetailsApi(agent_name);
      console.log('Agent details:', getDetails);
      return getDetails;
    } catch (error) {
      console.error('Error fetching agent details:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (agent_name) {
        const details = await fetchAgentDetails(agent_name);
        if (details) {
          // Redirect to chatbot page with the chatbotId
             dispatch(setThreadId({ threadId: details.thread_id || window.navigator.userAgent.replace(/\D+/g, '') }));
             dispatch(setDataInAppInfoReducer({ threadId: details.thread_id || window.navigator.userAgent.replace(/\D+/g, '')}))
             if(details?.bridgeName)
             {
              dispatch(setDataInAppInfoReducer({ bridgeName: details.bridgeName }))
              dispatch(setThreadId({ bridgeName: details.bridgeName || "root" }));
              dispatch(
                addDefaultContext({
                  bridgeName: details.bridgeName,
                })
              );
             }
        window.location.href = `/chatbot?interfaceDetails=${encodeURIComponent(JSON.stringify(details))}`;
        }
      }
    };
    
    fetchData();
  }, [agent_name, fetchAgentDetails]);

  return (
    <div>
      {children}
    </div>
  );
}
