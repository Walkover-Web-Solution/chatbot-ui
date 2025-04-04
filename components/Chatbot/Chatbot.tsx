import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { ParamsEnums } from '@/utils/enums';
import React from 'react'

function Chatbot({ chatbotId }: { chatbotId: string }) {
    
    return (
        <div>Chatbot</div>
    )
}

export default React.memo(
    addUrlDataHoc(React.memo(Chatbot), [ParamsEnums.chatbotId])
);