'use client';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store, persistor } from '../store'
import { generateTheme } from '@/hoc/theme';
import { GetSessionStorageData } from '@/utils/ChatbotUtility';

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
    handleThemeChange: (color: string) => { },
});

function AppWrapper({
    children,
}: AppWrapperProps) {
    const themeFromSession = JSON.parse(GetSessionStorageData('helloConfig') || '{}')?.primary_color;

    const [themeColor, setThemeColor] = useState(themeFromSession || "#333333");
    const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const root = document.documentElement;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

        const applyScheme = (isDark: boolean) => {
            const scheme = isDark ? "dark" : "light";
            setColorScheme(scheme);
            root.setAttribute("data-theme", scheme);
        };

        applyScheme(prefersDark.matches);

        const handleSchemeChange = (event: MediaQueryListEvent) => {
            applyScheme(event.matches);
        };

          if (typeof prefersDark.addEventListener === "function") {
            prefersDark.addEventListener("change", handleSchemeChange);
            return () => prefersDark.removeEventListener("change", handleSchemeChange);
        } else {
            prefersDark.addListener(handleSchemeChange);
            return () => prefersDark.removeListener(handleSchemeChange);
        }
    }, []);

    const theme = useMemo(() => generateTheme(themeColor, colorScheme), [themeColor, colorScheme]);

    const handleThemeChange = useCallback((color: string) => {
        setThemeColor(color);
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