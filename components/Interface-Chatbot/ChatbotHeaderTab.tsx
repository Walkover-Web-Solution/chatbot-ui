import React from "react";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";

function ChatbotHeaderTab({ chatSessionId }: { chatSessionId: string }) {
  // Human support feature not enabled
  return null;
}

export default React.memo(addUrlDataHoc(ChatbotHeaderTab));