import { useState } from "react";
import { Download } from "lucide-react"; // or any icon library
import { useMediaQuery } from "@mui/material";

const ImageWithFallback = ({ src, alt, style }: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}) => {
  const isSmallScreen = useMediaQuery('(max-width:1023px)');

  const [error, setError] = useState(false);
const downloadImage = async (url: string) => {
 window.parent.postMessage({
    type: "downloadImage",
    url: url
 }, "*");
};

  return (
    <div className="relative flex justify-end w-fit group">
      <img
        src={!error ? src : 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png'}
        onError={() => setError(true)}
        alt={alt}
        className={`block ${isSmallScreen ? 'max-w-[80%]' : 'max-w-[40%]'} h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => window.open(src, "_blank")}
        style={style}
      />
     {!error &&  <button
  onClick={() => downloadImage(src)}
  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
  title="Download Image"
>
  <Download size={16} className="text-gray-800" />
</button>}
    </div>
  );
};

export default ImageWithFallback;
