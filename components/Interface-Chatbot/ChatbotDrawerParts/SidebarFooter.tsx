"use client";
import React from "react";
import { useComponentOverride } from "./useComponentOverride";

const SidebarFooter = () => {
  const Override = useComponentOverride(["sidebar", "footer"]);
  if (Override) return <Override />;

  return (
    <div className="px-4 pt-2 pb-2 flex items-center justify-center mt-auto">
      <div className="text-xs text-gray-500 dark:text-slate-400 flex items-baseline gap-1">
        Powered by
        <a
          href="https://gtwy.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex hover:opacity-80 transition-opacity"
        >
          <span className="font-bold">GTWY</span>
        </a>
      </div>
    </div>
  );
};

export default SidebarFooter;
