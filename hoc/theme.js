import { createTheme } from "@mui/material/styles";

export const generateTheme = (colorHex, mode = "light") => {
  const isDark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: {
        main: colorHex,
      },
      secondary: {
        main: colorHex,
      },
      background: {
        default: isDark ? "#222222" : "#f8f8f8",
        paper: isDark ? "#1b1b1b" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f8fafc" : "#000000",
        secondary: isDark ? "#cbd5f5" : "#ffffff",
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
