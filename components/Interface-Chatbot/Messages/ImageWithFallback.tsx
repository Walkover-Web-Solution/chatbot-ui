import { useState } from "react";
import { Download, FileWarning, FileText } from "lucide-react";
import { useMediaQuery } from "@mui/material";

type ImageWithFallbackProps = {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  canDownload?: boolean;
};

const getFileType = (url: string): string => {
  const extension = url.split(".").pop()?.toLowerCase().split("?")[0] || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension)) return "image";
  if (["mp4", "webm", "ogg"].includes(extension)) return "video";
  if (["mp3", "wav", "aac", "flac"].includes(extension)) return "audio";
  if (["pdf"].includes(extension)) return "pdf";
  return "other"; // e.g. xlsx, csv, html, zip, etc.
};

const ImageWithFallback = ({ src, alt = "attachment", style, canDownload = true }: ImageWithFallbackProps) => {
  const fileType = getFileType(src);
  const isSmallScreen = useMediaQuery('(max-width:1023px)');
  const [error, setError] = useState(false);

  const downloadFile = () => {
    window.parent.postMessage({
      type: "downloadAttachment",
      url: src
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
            className={`block ${isSmallScreen ? 'max-w-[80%]' : 'max-w-[40%]'} h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={() => window.open(src, "_blank")}
            style={style}
          />
        );
      case "video":
        return (
        
            <video controls className="max-w-full rounded-md"      onError={() => setError(true)} style={style}>
            <source src={src} type={`video/${src.split('.').pop()}`} />
            Your browser does not support the video tag.
          </video>
        );
      case "audio":
        return (
          <audio controls onError={() => setError(true)}>
            <source src={src} type={`audio/${src.split('.').pop()}`} />
            {/* Your browser does not support the audio element. */}
          </audio>
        );
      default:
        return (
          <img
            src="https://cdn1.iconfinder.com/data/icons/leto-files/64/leto_files-68-128.png"
            alt={alt}
            onError={() => setError(true)}
            className={`block ${isSmallScreen ? 'max-w-[80%]' : 'max-w-[40%]'} h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={() => window.open(src, "_blank")}
            style={style}
          />
        );
    }
  };

  return (
    <div className="relative flex justify-end w-fit group">
      {renderContent()}
      {!error && canDownload && (
        <button
          onClick={downloadFile}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          title="Download"
        >
          <Download size={16} className="text-gray-800" />
        </button>
      )}
    </div>
  );
};

export default ImageWithFallback;
