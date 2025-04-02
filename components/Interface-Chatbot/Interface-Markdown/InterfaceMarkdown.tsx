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
        props?.content ||
        props?.data ||
        `I'm a markdown component.`}
    </ReactMarkdown>
  );
}

export default InterfaceMarkdown;
