import { createTheme } from "@mui/material/styles";

export const generateTheme = (colorHex) => {
  return createTheme({
    palette: {
      primary: {
        main: colorHex,
      },
      secondary: {
        main: colorHex,
      },
      background: {
        default: "#f8f8f8", // Light grey
        paper: "#ffffff", // White
      },
      text: {
        primary: "#000000", // Black
        secondary: "#ffffff", // White for secondary text
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: colorHex,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: colorHex,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: colorHex,
              },
            },
          },
        },
      },
      MuiLinearProgress: {
        // styleOverrides: {
        //   colorPrimary: {
        //     backgroundColor: colorHex,
        //   },
        // },
      },
    },
  });
};