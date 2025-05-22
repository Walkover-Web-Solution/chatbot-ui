import { useMediaQuery } from "@mui/material";
import ImageWithFallback from "../Interface-Chatbot/Messages/ImageWithFallback";
import { linkify } from "@/utils/utilities";

function RenderHelloAttachmentMessage({ message }: { message: any }) {

  const caption = message?.messageJson?.text;

  const renderAttachment = (attachment: any) => {
    const { path, name } = attachment;
    return <div className="w-full my-2">
      <div className="flex gap-2">
        <ImageWithFallback
          src={path}
          alt={name || 'Image attachment'}
          style={{ maxHeight: '300px' }}
        />
      </div>
    </div>
  };

  return (
    <div className="attachment-message w-full">
      {message?.messageJson?.attachment?.map((item: any, index: number) => (
        <div key={index} className="w-full">
          {renderAttachment(item)}
        </div>
      ))}
      {caption && (
        <div className="flex justify-between items-center w-full mt-1">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: linkify(message?.content) }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RenderHelloAttachmentMessage
