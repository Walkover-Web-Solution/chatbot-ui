import { useMediaQuery } from "@mui/material";
import ImageWithFallback from "../Interface-Chatbot/Messages/ImageWithFallback";

function RenderHelloAttachmentMessage({ message }: { message: any }) {

  const caption = message?.messageJson?.text;

  const renderAttachment = (attachment: any) => {
    const { mime_type, path, name, extension } = attachment;
    if (mime_type?.startsWith('image/')) {
      return (
        <div className="w-full">
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
      );
    } else if (mime_type?.startsWith('video/')) {
      return (
        <div className="w-full">
          <div className="flex gap-2">
            <video
              controls
              className="max-w-full rounded-md mb-1"
              style={{ maxHeight: '300px' }}
            >
              <source src={path} type={mime_type} />
              Your browser does not support the video tag.
            </video>

       
            */}
          </div>
          {caption && (
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-gray-600 truncate max-w-[70%]">{caption}</span>
            </div>
          )}
        </div>
      );
    } else if (mime_type?.startsWith('audio/')) {
      return (
        <div className="w-full">
          <div className="flex gap-2">
            <audio controls className="w-full mb-1" style={{ maxWidth: '500px' }} >
              <source src={path} type={mime_type} />
              Your browser does not support the audio element.
            </audio>

            {/* Download button commented out
            <div className="flex justify-center mt-4">
              <a 
                href={path}
                download={name || 'audio'}
                className="btn btn-ghost btn-xs"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
            */}
          </div>
          {caption && (
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-gray-600 truncate max-w-[70%]">{caption}</span>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="w-full" style={{ maxWidth: '500px' }}>
          <div className="flex items-center justify-between p-3 border rounded-md mb-2 w-full">
            <div className="flex items-center">
              <div className="mr-3 bg-gray-100 p-2 rounded-md">
                <span className="text-xs font-bold uppercase">{extension || 'FILE'}</span>
              </div>
              <span className="text-sm truncate">{name || 'File attachment'}</span>
            </div>
            {/* Download button commented out
            <a 
              href={path}
              download={name || 'file'}
              className="btn btn-ghost btn-xs"
            >
              <Download className="w-4 h-4" />
            </a>
            */}
          </div>
          {caption && (
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-gray-600 truncate max-w-[70%]">{caption}</span>
            </div>
          )}
        </div>
      );
    }
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
