import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { IconButton } from "@mui/material";
import React from "react";
import "./InterfaceChatbot.css";

function MoveToDownButton({ movetoDown, showScrollButton, backgroundColor, textColor }: { movetoDown: () => void, showScrollButton: boolean, backgroundColor: string, textColor: string }) {
  if (!showScrollButton) return null;
  return (
    <IconButton
      onClick={movetoDown}
      className="move-to-down-button"
      sx={{
        backgroundColor: backgroundColor || "#333",
        color: textColor || "white",
        position: "fixed",
        bottom: "20px",
        right: "20px",
      }}
      disableRipple
    >
      <KeyboardDoubleArrowDownIcon color="inherit" />
    </IconButton>
  );
}

export default MoveToDownButton;
