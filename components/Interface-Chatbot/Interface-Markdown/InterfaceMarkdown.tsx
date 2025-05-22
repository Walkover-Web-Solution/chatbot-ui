/* eslint-disable */
import { supportsLookbehind } from "@/utils/appUtility.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Anchor, Code } from "./MarkdownUtitily.tsx";

function InterfaceMarkdown({ props }: any) {
  return (
    <ReactMarkdown
      // remarkPlugins={[remarkGfm]}
      {...(!supportsLookbehind() ? {} : { remarkPlugins: [remarkGfm] })}
      components={{
        code: Code,
        a: Anchor,
      }}
    >
      {props?.children ||
        props?.text ||
        (typeof props?.content === 'object'
          ? (props?.content?.content
            ? (typeof props?.content?.content === 'object'
              ? JSON.stringify(props?.content?.content)
              : props?.content?.content)
            : JSON.stringify(props?.content))
          : props?.content) ||
        (typeof props?.data === 'object' ? JSON.stringify(props?.data) : props?.data) ||
        `I'm a markdown component.`}
    </ReactMarkdown>
  );
}

export default InterfaceMarkdown;
