import { perFormAction } from "@/utils/ChatbotUtility";
import { CardActionArea } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import * as React from "react";

function InterfaceCard({ props, action }: any) {
  delete props?.action;

  const handleClickCard = () => {
    // if (action?.actionId) {
    perFormAction(action);
    // }
  };

  return (
    <Card
      sx={{ display: "flex", minWidth: "350px", maxWidth: "100%" }}
      className="mb-2 cursor-pointer"
    >
      <CardActionArea onClick={handleClickCard}>
        <Box sx={{ display: "flex", flexDirection: "row" }} className="p-1 items-center">
          {props?.image ||
            (props?.imageURL && (
              <CardMedia
                component="img"
                sx={{ width: 50 }}
                image={
                  props?.image ||
                  props?.imageURL ||
                  "https://static-00.iconduck.com/assets.00/google-icon-512x512-wk1c10qc.png"
                }
                alt="Card Image"
              />
            ))}
          <CardContent className="!p-2 w-full">
            <Typography>
              {props?.title ||
                props?.heading ||
                props?.children ||
                "Card Title"}
            </Typography>
            <Typography variant="caption">
              {props?.description || props?.subtitle || ""}
            </Typography>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}
export default InterfaceCard;
