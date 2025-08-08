import { PdfLogo } from "@/assests/assestsIndex";
import { useScreenSize } from "@/components/Chatbot/hooks/useScreenSize";
import { Download, FileWarning } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

type ImageWithFallbackProps = {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  canDownload?: boolean;
  preview?: boolean;
};

// Constants
const FILE_EXTENSIONS = {
  image: ["jpg", "jpeg", "png", "gif", "webp", "bmp"] as string[],
  video: ["mp4", "webm", "ogg"] as string[],
  audio: ["mp3", "wav", "aac", "flac"] as string[],
  pdf: ["pdf"] as string[],
};

const FALLBACK_ICON = "https://cdn1.iconfinder.com/data/icons/leto-files/64/leto_files-68-128.png";

// Memoized utility function
const getFileType = (url: string): string => {
  if (!url) return "other"; // e.g. null, undefined, empty string
  const extension = url?.split(".")?.pop()?.toLowerCase()?.split("?")[0] || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension)) return "image";
  if (["mp4", "webm", "ogg"].includes(extension)) return "video";
  if (["mp3", "wav", "aac", "flac"].includes(extension)) return "audio";
  if (["pdf"].includes(extension)) return "pdf";
  return "other"; // e.g. xlsx, csv, html, zip, etc.
};

// Memoized play button SVG
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// Memoized error component
const ErrorDisplay = () => (
  <div className="w-60 h-40 flex items-center justify-center border rounded-md bg-gray-100 text-gray-500">
    <FileWarning className="w-6 h-6 mr-2" />
    Failed to load
  </div>
);

// Memoized download button
const DownloadButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="absolute top-2 right-2 px-2 pt-1 ml-2 bg-gray-200 shadow-md rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
  >
    <div className="tooltip tooltip-left" data-tip="Download">
      <Download size={18} />
    </div>
  </button>
);

const ImageWithFallback = ({
  src,
  alt = "attachment",
  style,
  canDownload = true,
  preview = false
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);
  const { isSmallScreen } = useScreenSize();

  // Memoized file type calculation
  const fileType = useMemo(() => getFileType(src), [src]);

  // Memoized video type for source element
  const videoType = useMemo(() =>
    fileType === "video" ? `video/${src.split('.').pop()}` : "",
    [fileType, src]
  );

  // Memoized audio type for source element
  const audioType = useMemo(() =>
    fileType === "audio" ? `audio/${src.split('.').pop()}` : "",
    [fileType, src]
  );

  // Memoized callbacks
  const handleError = useCallback(() => setError(true), []);

  const handleClick = useCallback(() => {
    window.open(src, "_blank");
  }, [src]);

  const downloadFile = useCallback(() => {
    window.parent.postMessage({
      type: "downloadAttachment",
      data: { url: src }
    }, "*");
  }, [src]);

  // Memoized container classes
  const containerClasses = useMemo(() =>
    `flex relative group ${isSmallScreen ? 'max-w-[80%]' : 'max-w-[40%]'} h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity`,
    [isSmallScreen]
  );

  const renderContent = useCallback(() => {
    if (error) return <ErrorDisplay />;

    switch (fileType) {
      case "image":
        return (
          <img
            src={src}
            alt={alt}
            onError={handleError}
            onClick={handleClick}
            style={style}
          />
        );

      case "video":
        return preview ? (
          <div
            className="max-w-full rounded-md relative"
            style={style}
            onClick={handleClick}
          >
            <video
              className="w-full h-full object-cover rounded-md"
              onError={handleError}
            >
              <source src={src} type={videoType} />
            </video>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <PlayIcon />
              </div>
            </div>
          </div>
        ) : (
          <video
            controls
            className="max-w-full rounded-md"
            onError={handleError}
            style={style}
          >
            <source src={src} type={videoType} />
            Your browser does not support the video tag.
          </video>
        );

      case "audio":
        return (
          <div className="w-full min-w-[300px] pr-10 relative">
            <audio
              controls
              onError={handleError}
              className="w-full"
            >
              <source src={src} type={audioType} />
            </audio>
          </div>
        );

      case "pdf":
        return (
          <Image
            src={PdfLogo}
            alt={alt}
            width={100}
            height={100}
            onClick={handleClick}
            style={style}
          />
        );

      default:
        return (
          <img
            src={FALLBACK_ICON}
            alt={alt}
            onError={handleError}
            onClick={handleClick}
            style={style}
          />
        );
    }
  }, [error, fileType, src, alt, style, preview, handleError, handleClick, videoType, audioType]);

  return (
    <div className={containerClasses}>
      {renderContent()}
      {!error && canDownload && <DownloadButton onClick={downloadFile} />}
    </div>
  );
};

export default ImageWithFallback;