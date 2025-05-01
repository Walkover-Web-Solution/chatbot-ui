import { useMediaQuery } from "@mui/material";
import ImageWithFallback from "../Interface-Chatbot/Messages/ImageWithFallback";

function RenderHelloAttachmentMessage({ message }: { message: any }) {

  const caption = message?.messageJson?.text;

  const renderAttachment = (attachment: any) => {
    const {path, name } = attachment;
    return     <div className="w-full">
    <div className="flex gap-2">
  
<ImageWithFallback
 src={path}
 alt={name || 'Image attachment'}
 style={{ maxHeight: '300px' }}
  />


    </div>
    {caption && (
      <div className="flex justify-between items-center w-full mt-1">
        <span className="text-sm text-gray-600 truncate max-w-[70%]">{caption}</span>
      </div>
    )}
  </div>
  };

  return (
    <div className="attachment-message w-full">
      {message?.messageJson?.attachment?.map((item: any, index: number) => (
        <div key={index} className="w-full">
          {renderAttachment(item)}
        </div>
      ))}
    </div>
  );
}

export default RenderHelloAttachmentMessage
