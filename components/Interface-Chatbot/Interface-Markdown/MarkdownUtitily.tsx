/* eslint-disable */
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";
import { Typography } from "@mui/material";
import copy from "copy-to-clipboard";
import React, { useState } from "react";
import { CodeBlock } from "./CodeBlock";

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
    <div className="py-4">
      <div
        className="flex justify-between items-center cursor-pointer py-2 px-3 rounded-t-lg border-b border-base-300 dark:border-base-600 bg-base-200 dark:bg-base-700"
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,
            color: "var(--fallback-bc,oklch(var(--bc)/0.75))",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontSize: "0.7rem"
          }}
        >
          {match[1]}
        </Typography>
        <button
          onClick={() => handlecopyfunction(children)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:opacity-80 rounded-md px-2.5 py-1 border ${
            tipForCopy
              ? "bg-success/10 text-success border-success/30"
              : "bg-base-100/70 dark:bg-base-800/70 text-base-content/75 border-base-300/70 dark:border-base-600/70"
          }`}
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

export const Anchor = ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
  return (
    <a href={href} target="_blank" rel="noreferrer" {...props} className="link link-primary">
      {children}
    </a>
  );
};
