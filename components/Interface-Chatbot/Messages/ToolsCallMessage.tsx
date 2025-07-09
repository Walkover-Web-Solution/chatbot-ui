import { CircleCheckBig } from "lucide-react";
import React, { useMemo } from "react";

// Memoized tools call component to prevent re-renders on unrelated updates
const ToolsCallMessage = React.memo(({ message }: { message: any }) => {
    const toolsCallEntries = useMemo(() =>
        message?.tools_call_data?.[0] ? Object.entries(message.tools_call_data[0]) : [],
        [message?.tools_call_data]
    );

    const functionCount = useMemo(() =>
        Object.keys(message?.function || {}).length,
        [message?.function]
    );

    if (!functionCount) return null;

    return (
        <div className="flex gap-2 pl-3 items-center">
            <div className="collapse collapse-arrow w-full">
                <input type="checkbox" />
                <div className="collapse-title flex flex-row items-center w-full max-w-64">
                    <CircleCheckBig color="green" size={20} />
                    <p className="text-base text-green-900 ml-2">
                        {Object.keys(message?.tools_call_data?.[0] || {}).length} Functions executed
                    </p>
                </div>
                <div className="collapse-content w-full gap-2">
                    <div className="flex flex-col gap-2">
                        {toolsCallEntries.map(([key, funcData], index) => (
                            <div key={key} className="text-sm text-gray-600">
                                <p>
                                    <span className="font-medium">Step {index + 1}: </span>
                                    <span className="truncate inline-block align-bottom" title={funcData?.name}>
                                        {funcData?.name}
                                    </span>
                                    <span className="font-light"> (Function executed)</span>
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="rounded-lg">
                        <p className="text-sm text-green-700 font-medium">AI responded...</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ToolsCallMessage;