/* eslint-disable */
import { ExternalLink } from "lucide-react";
import React from "react";
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
  return (
    <CodeBlock
      inline={inline}
      className={className}
      data-testid="chatbot-interface-markdown-code"
      {...props}
    >
      {children}
    </CodeBlock>
  );
};

export const Anchor = ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      {...props}
      className="inline text-blue-500 font-medium underline underline-offset-2 decoration-blue-300 hover:text-blue-700 hover:decoration-blue-600 transition-colors duration-150 break-words [overflow-wrap:anywhere]"
      data-testid="chatbot-interface-markdown-anchor"
    >
      <span className="">{children}</span>
      <ExternalLink className="inline-block w-3 h-3 ml-1 align-text-bottom opacity-70" aria-hidden="true" />
    </a>
  );
};

export const UnorderedList = ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className="list-disc pl-6 my-2 space-y-1" {...props}>{children}</ul>
);

export const OrderedList = ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
  <ol className="list-decimal pl-6 my-2 space-y-1" {...props}>{children}</ol>
);

export const ListItem = ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li className="leading-relaxed" {...props}>{children}</li>
);
