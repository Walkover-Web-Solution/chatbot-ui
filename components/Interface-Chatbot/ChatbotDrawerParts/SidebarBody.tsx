"use client";
import React from "react";
import ThreadList, { ThreadListProps } from "./ThreadList";
import { useComponentOverride } from "./useComponentOverride";

export type SidebarBodyProps = ThreadListProps;

const SidebarBody = (props: SidebarBodyProps) => {
  const Override = useComponentOverride(["sidebar", "body"]);
  if (Override) return <Override {...props} />;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4">
        <div className="menu p-0 w-full h-full bg-base-200 text-base-content">
          <ThreadList {...props} />
        </div>
      </div>
    </div>
  );
};

export default SidebarBody;
