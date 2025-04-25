import { Box, Grid, useTheme } from "@mui/material";
import React, { useEffect } from "react";
import { ChatbotHeaderPreview } from "../Interface-Chatbot/ChatbotHeader.tsx";
import ChatbotTextField from "../Interface-Chatbot/ChatbotTextField.tsx";
import MessageList from "../Interface-Chatbot/MessageList.tsx";

function ChatbotPreview({ onThemeChange }) {
  const theme = useTheme();
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.type === "themeChange") {
        onThemeChange(event.data.themeColor || "#000000");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        // backgroundColor: theme.palette.background.default,
      }}
    >
      <ChatbotHeaderPreview
        title="Chatbot Header"
        subtitle="Chatbot Subtitle"
      />
      <Grid
        item
        xs
        className="second-grid"
        sx={{ paddingX: 0.2, paddingBottom: 0.2 }}
      >
        <MessageList dragRef={null} />
        {/* <DefaultQuestions
            defaultQuestion={defaultQuestion}
            messageRef={messageRef}
            onSend={onSend}
          /> */}
      </Grid>
      <Grid
        item
        xs={12}
        className="third-grid"
        sx={{
          backgroundColor: theme.palette.background.paper,
          paddingX: theme.spacing(3),
          display: "flex",
          alignItems: "end",
          marginBottom: theme.spacing(2),
          // borderTop:"2px black solid"
        }}
      >
        <ChatbotTextField messageRef={null} disabled />
      </Grid>
    </Box>
  );
}

export default ChatbotPreview;
