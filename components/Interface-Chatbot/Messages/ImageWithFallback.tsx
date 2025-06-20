import { useState } from "react";
import { Download, FileWarning, FileText } from "lucide-react";
import { useMediaQuery } from "@mui/material";

type ImageWithFallbackProps = {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  canDownload?: boolean;
  preview?: boolean;
};

const getFileType = (url: string): string => {
  if (!url) return "other"; // e.g. null, undefined, empty string
  const extension = url?.split(".")?.pop()?.toLowerCase()?.split("?")[0] || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension)) return "image";
  if (["mp4", "webm", "ogg"].includes(extension)) return "video";
  if (["mp3", "wav", "aac", "flac"].includes(extension)) return "audio";
  if (["pdf"].includes(extension)) return "pdf";
  return "other"; // e.g. xlsx, csv, html, zip, etc.
};

const ImageWithFallback = ({ src, alt = "attachment", style, canDownload = true, preview = false }: ImageWithFallbackProps) => {
  const fileType = getFileType(src);
  const isSmallScreen = useMediaQuery('(max-width:1023px)');
  const [error, setError] = useState(false);

  const downloadFile = () => {
    window.parent.postMessage({
      type: "downloadAttachment",
      data: {
        url: src
      }
    }, "*");
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="w-60 h-40 flex items-center justify-center border rounded-md bg-gray-100 text-gray-500">
          <FileWarning className="w-6 h-6 mr-2" />
          Failed to load
        </div>
      );
    }

    switch (fileType) {
      case "image":
        return (
          <img
            src={src}
            alt={alt}
            onError={() => setError(true)}
            onClick={() => window.open(src, "_blank")}
            style={style}
          />
        );
      case "video":
        return preview ? (
          <div
            className="max-w-full rounded-md relative"
            style={style}
            onClick={() => window.open(src, "_blank")}
          >
            <video
              className="w-full h-full object-cover rounded-md"
              onError={() => setError(true)}
            >
              <source src={src} type={`video/${src.split('.').pop()}`} />
            </video>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <video controls className="max-w-full rounded-md" onError={() => setError(true)} style={style}>
            <source src={src} type={`video/${src.split('.').pop()}`} />
            Your browser does not support the video tag.
          </video>
        );
      case "audio":
        return (
          <div className="w-full min-w-[300px] pr-10 relative">
            <audio
              controls
              onError={() => setError(true)}
              className="w-full"
            >
              <source src={src} type={`audio/${src.split('.').pop()}`} />
            </audio>
          </div>
        );
      default:
        return (
          <img
            src="https://cdn1.iconfinder.com/data/icons/leto-files/64/leto_files-68-128.png"
            alt={alt}
            onError={() => setError(true)}
            onClick={() => window.open(src, "_blank")}
            style={style}
          />
        );
    }
  };

  return (
    <div
      className={`flex relative group ${isSmallScreen ? 'max-w-[80%]' : 'max-w-[40%]'} h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity`}
    >
      {renderContent()}
      {!error && canDownload && (
        <button
          onClick={downloadFile}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
          title="Download"
        >
          <Download size={16} className="text-gray-800" />
        </button>
      )}
    </div>
  );
};

export default ImageWithFallback;
