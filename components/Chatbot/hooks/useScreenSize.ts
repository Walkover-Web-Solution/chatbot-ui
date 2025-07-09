import { useMediaQuery } from "@mui/material";

export const useScreenSize = () => {
    const isSmallScreen = useMediaQuery('(max-width: 1023px)');
    return { isSmallScreen };
}