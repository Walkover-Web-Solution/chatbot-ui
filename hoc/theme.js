import { createTheme } from "@mui/material/styles";

const hexToHsl = (hex) => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.substring(0, 2), 16) / 255;
  const g = parseInt(full.substring(2, 4), 16) / 255;
  const b = parseInt(full.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const delta = max - min;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
};

// Keeps hue/saturation intact and only raises lightness enough to stay
// visible on the dark background, so a gold stays gold instead of
// washing out toward white the way mixing with white would.
const getDarkModePrimary = (hex) => {
  const { h, s, l } = hexToHsl(hex);
  const minLightness = 55;
  const targetLightness = Math.min(Math.max(l, minLightness), 75);
  return `hsl(${h}, ${Math.max(s, 45)}%, ${targetLightness}%)`;
};

export const generateTheme = (colorHex, mode = "light") => {
  const isDark = mode === "dark";
  const primaryColor = isDark ? getDarkModePrimary(colorHex) : colorHex;
  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: primaryColor,
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
            backgroundColor: primaryColor,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: primaryColor,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: primaryColor,
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
