import EastIcon from "@mui/icons-material/East";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import "./InterfaceChatbot.css";

function DefaultQuestions({ defaultQuestion, messageRef, onSend }) {
  return (
    <Grid container spacing={2} sx={{ marginTop: 2 }}>
      {defaultQuestion.map((response: string, index: number) => (
        <Grid item xs={6} sm={6} key={`${resposne?.length}${index}`}>
          <Box
            sx={{
              borderRadius: "5px",
              boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.2)",
              border: ".5px solid #1976d2",
            }}
            className="w-100 h-100 flex-spaceBetween-center cursor-pointer p-3 pl-3"
            onClick={() => {
              messageRef.current.value = response;
              onSend();
            }}
          >
            <Typography variant="subtitle2">{response}</Typography>
            <EastIcon />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export default DefaultQuestions;
