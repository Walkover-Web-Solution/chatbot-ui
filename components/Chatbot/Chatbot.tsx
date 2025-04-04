import { addUrlDataHoc } from '@/hoc/addUrlDataHoc';
import { ParamsEnums } from '@/utils/enums';
import React from 'react'
import useHelloIntegration from './hooks/useHelloIntegration';

function Chatbot({ chatbotId }: { chatbotId: string }) {
    useHelloIntegration();

    return (
        <div>Chatbot</div>
    )
}

export default React.memo(
    addUrlDataHoc(React.memo(Chatbot), [ParamsEnums.chatbotId])
);