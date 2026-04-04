'use client';
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store, persistor } from '../store'
import { generateTheme } from '@/hoc/theme';
import { GetSessionStorageData, SetSessionStorage } from '@/utils/ChatbotUtility';

interface AppWrapperProps {
    children: React.ReactNode
    chatbotConfig?: any // TODO: Add proper type
    themeColor?: string
    onConfigChange?: (config: any) => void
    handleThemeChange?: (color: string) => void
    toggleHideCloseButton?: () => void
}

export const ThemeContext = createContext({
    themeColor: "#000000",
    handleThemeChange: (_color: string) => { },
    handleColorSchemeChange: (_scheme: "light" | "dark" | "system") => { },
});

function AppWrapper({
    children,
}: AppWrapperProps) {
    const themeFromSession = JSON.parse(GetSessionStorageData('helloConfig') || '{}')?.primary_color;

    const themeFromSessionStorage = GetSessionStorageData('chatbotTheme') as "light" | "dark" | "system" | null;

    const [themeColor, setThemeColor] = useState(themeFromSession || "#333333");
    const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
    const manualSchemeOverride = useRef(themeFromSessionStorage === "light" || themeFromSessionStorage === "dark");

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const root = document.documentElement;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

        const applyScheme = (isDark: boolean) => {
            if (manualSchemeOverride.current) return;
            const scheme = isDark ? "dark" : "light";
            setColorScheme(scheme);
            root.setAttribute("data-theme", scheme);
        };

        // If a theme was stored in session, apply it; otherwise fall back to system
        if (themeFromSessionStorage === "light" || themeFromSessionStorage === "dark") {
            setColorScheme(themeFromSessionStorage);
            root.setAttribute("data-theme", themeFromSessionStorage);
        } else {
            applyScheme(prefersDark.matches);
        }

        const handleSchemeChange = (event: MediaQueryListEvent) => {
            applyScheme(event.matches);
        };

        prefersDark.addEventListener("change", handleSchemeChange);
        return () => prefersDark.removeEventListener("change", handleSchemeChange);
    }, []);

    const theme = useMemo(() => generateTheme(themeColor, colorScheme), [themeColor, colorScheme]);

    const handleThemeChange = useCallback((color: string) => {
        setThemeColor(color);
    }, []);

    const handleColorSchemeChange = useCallback((scheme: "light" | "dark" | "system") => {
        SetSessionStorage('chatbotTheme', scheme);
        if (scheme === "system") {
            manualSchemeOverride.current = false;
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const resolved = isDark ? "dark" : "light";
            setColorScheme(resolved);
            document.documentElement.setAttribute("data-theme", resolved);
        } else {
            manualSchemeOverride.current = true;
            setColorScheme(scheme);
            document.documentElement.setAttribute("data-theme", scheme);
        }
    }, []);

    return (
        <>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <ThemeContext.Provider value={{
                            themeColor,
                            handleThemeChange,
                            handleColorSchemeChange,
                        }}>
                            {children}
                        </ThemeContext.Provider>
                    </ThemeProvider>
                </PersistGate>
            </Provider>
        </>
    )
}

export default AppWrapper