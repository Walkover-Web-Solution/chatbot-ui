import React from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

// Import the languages you want to support
import js from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";

// Register languages
SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("markdown", markdown);

// CodeBlock component
export function CodeBlock({
  inline = false,
  className = "",
  children,
  isDark = true,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  isDark?: boolean;
}) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text";
  
  // Always use dark theme
  const codeStyle = vscDarkPlus;

  return !inline ? (
    <div className="text-sm m-0 w-full">
      <SyntaxHighlighter
        style={codeStyle}
        customStyle={{
          backgroundColor: "#1E1E1E",
          margin: 0,
          padding: "1rem",
          borderRadius: "0 0 0.375rem 0.375rem",
          border: "1px solid",
          borderColor: "#333",
        }}
        language={language}
        wrapLongLines
        codeTagProps={{
          style: { 
            whiteSpace: "pre-wrap", 
            fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
            fontSize: "0.9em",
          },
        }}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code 
      className={`${className} inline-code`}
      style={{ 
        backgroundColor: "#1E1E1E",
        color: "#D4D4D4",
        padding: "0.2em 0.4em",
        borderRadius: "3px",
        fontSize: "85%",
        fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
        border: "1px solid",
        borderColor: "#333",
      }}
      {...props}
    >
      {children}
    </code>
  );
}
