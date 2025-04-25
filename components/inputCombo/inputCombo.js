// @author-ArthrajRathore
import { React, useState } from "react";
import "./inputCombo.css";
import { Box, Tooltip, Typography, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import copy from "copy-to-clipboard";

function InputCombo(props) {
  const [tipForCopy, setTipForCopy] = useState(false);

  const handlecopyfunction = () => {
    copy(props?.copyValue);
    setTipForCopy(true);
    setTimeout(() => {
      setTipForCopy(false);
    }, 800);
  };

  return (
    <Box className="p-1 inputcontainer">
      <Typography variant="base">{props?.stepName}</Typography>

      <Box className="inputcontainer__combo flex-spaceBetween-center mt-1 border-1 w-100 p-1 ">
        <Typography className="overflow-scroll" variant="caption">
          {props?.value}
        </Typography>
        <Tooltip
          placement="top"
          onClick={handlecopyfunction}
          title={tipForCopy ? "copied" : "copy"}
        >
          <IconButton>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default InputCombo;
