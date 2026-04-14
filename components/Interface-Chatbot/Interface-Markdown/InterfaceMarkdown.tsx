/* eslint-disable */
import { supportsLookbehind } from "@/utils/appUtility";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Anchor, Code } from "./MarkdownUtitily";

interface InterfaceMarkdownProps {
  children: string;
  className?: string;
}

function InterfaceMarkdown({ children, className }: InterfaceMarkdownProps) {
  return (
    <div className={`prose prose-sm md:prose-base max-w-none text-inherit dark:prose-invert${className ? ` ${className}` : ""}`}>
      <ReactMarkdown
        {...(!supportsLookbehind() ? {} : { remarkPlugins: [remarkGfm] })}
        components={{
          code: Code,
          a: Anchor,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default InterfaceMarkdown;
