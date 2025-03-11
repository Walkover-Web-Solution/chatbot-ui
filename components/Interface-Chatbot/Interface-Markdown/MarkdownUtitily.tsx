/* eslint-disable */
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";
import { Typography } from "@mui/material";
import copy from "copy-to-clipboard";
import React, { useState } from "react";
import { CodeBlock } from "./CodeBlock.tsx";

export const Code = ({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}) => {
  const [tipForCopy, setTipForCopy] = useState(false);

  const handlecopyfunction = (text: any) => {
    copy(text);
    setTipForCopy(true);
    setTimeout(() => {
      setTipForCopy(false);
    }, 1500);
  };
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <div className="my-1">
      <div
        className="flex justify-between items-center cursor-pointer py-2 px-3"
        style={{
          backgroundColor: "#e5e7eb",
          borderTopRightRadius: 8,
          borderTopLeftRadius: 8,
          borderBottom: "1px solid #d1d5db"
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 500, 
            color: "#4b5563",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontSize: "0.7rem"
          }}
        >
          {match[1]}
        </Typography>
        <button
          onClick={() => handlecopyfunction(children)}
          className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:opacity-80 rounded-md px-2.5 py-1"
          style={{
            backgroundColor: tipForCopy ? "rgba(34, 197, 94, 0.1)" : "rgba(75, 85, 99, 0.2)",
            color: tipForCopy ? "#16a34a" : "#374151",
            border: tipForCopy ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(75, 85, 99, 0.3)"
          }}
        >
          {!tipForCopy ? (
            <>
              <ContentCopyIcon
                fontSize="inherit"
                sx={{ height: 16, width: 16 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>Copy code</Typography>
            </>
          ) : (
            <>
              <DoneIcon
                fontSize="inherit"
                sx={{ height: 16, width: 16 }}
                color="success"
              />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>Copied!</Typography>
            </>
          )}
        </button>
      </div>
      <CodeBlock inline={inline} className={className} {...props}>
        {children}
      </CodeBlock>
    </div>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export const Anchor = ({ href, children, ...props }) => {
  return (
    <a href={href} target="_blank" rel="noreferrer" {...props} className="link link-primary">
      {children}
    </a>
  );
};
