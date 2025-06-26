import { isColorLight } from "@/utils/themeUtility";
import { useTheme } from "@mui/material";

export const useColor = () => {
    const theme = useTheme();
    const backgroundColor = theme.palette.primary.main;
    const textColor = isColorLight(backgroundColor) ? "black" : "white";

    return { backgroundColor, textColor }
}