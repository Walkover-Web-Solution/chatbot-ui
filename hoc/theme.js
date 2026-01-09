import { createTheme } from "@mui/material/styles";

export const generateTheme = (colorHex, mode = 'light') => {
  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: colorHex,
      },
      secondary: {
        main: colorHex,
      },
      background: {
        default: mode === 'dark' ? "#121212" : "#f8f8f8",
        paper: mode === 'dark' ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: mode === 'dark' ? "#ffffff" : "#000000",
        secondary: mode === 'dark' ? "#b0b0b0" : "#666666",
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