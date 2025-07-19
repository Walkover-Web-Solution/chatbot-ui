import { linkify } from '@/utils/utilities'
import { Info } from 'lucide-react'
import React from 'react'

function VoiceCallMessage({ message }: { message: any }) {
    return (
        <div className="w-full mb-3 flex items-center gap-3">
            <Info className="text-blue-500" size={16} />
            <div className="prose max-w-none text-sm">
                <div dangerouslySetInnerHTML={{ __html: linkify(message?.content) }}></div>
            </div>
        </div>
    )
}

export default VoiceCallMessage