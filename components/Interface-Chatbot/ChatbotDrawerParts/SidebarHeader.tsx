"use client";
import React from "react";
import { AlignLeft, SquarePen, X } from "lucide-react";
import { useTheme } from "@mui/material";
import { useComponentOverride } from "./useComponentOverride";

export interface SidebarHeaderProps {
  isToggledrawer: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

const SidebarHeader = (props: SidebarHeaderProps) => {
  const Override = useComponentOverride(["sidebar", "header"]);
  if (Override) return <Override {...props} />;

  const theme = useTheme();
  const { isToggledrawer, onToggle, onNewChat } = props;
  const iconColor = theme.palette.text.primary;
  return (
    <div className="px-4 pt-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="w-10">
          {isToggledrawer && (
            <button
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              onClick={onToggle}
              data-testid="chatbot-drawer-toggle-button"
            >
              <AlignLeft size={22} color={iconColor} />
            </button>
          )}
        </div>
        <div className="flex flex-col items-center justify-center flex-1">
          <h2 className="text-lg font-bold text-center">Hello There!</h2>
        </div>
        <div className="flex items-center justify-end gap-1">
          {isToggledrawer && (
            <div className="tooltip tooltip-bottom z-[9999]" data-tip="New Chat">
              <button
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                onClick={onNewChat}
                data-testid="chatbot-drawer-new-chat-button"
              >
                <SquarePen size={22} color={iconColor} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
