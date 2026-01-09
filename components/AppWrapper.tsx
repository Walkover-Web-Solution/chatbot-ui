'use client';
import React, { createContext, useCallback, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store, persistor } from '../store'
import { generateTheme } from '@/hoc/theme';
import { GetSessionStorageData } from '@/utils/ChatbotUtility';

type ThemeMode = 'light' | 'dark' | 'system';

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
    themeMode: "light" as ThemeMode,
    handleThemeChange: (color: string) => { },
    handleModeChange: (mode: ThemeMode) => { },
});

function AppWrapper({
    children,
}: AppWrapperProps) {
    const themeFromSession = JSON.parse(GetSessionStorageData('helloConfig') || '{}')?.primary_color;

    const [themeColor, setThemeColor] = useState(themeFromSession || "#333333");
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');
    const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

    // Effect to handle system theme changes and initial resolution
    useEffect(() => {
        const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
            if (themeMode === 'system') {
                const newMode = e.matches ? 'dark' : 'light';
                setResolvedMode(newMode);
            }
        };

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Initial check
        if (themeMode === 'system') {
            handleSystemThemeChange(mediaQuery);
        } else {
            setResolvedMode(themeMode);
        }

        // Listener for system changes
        if (themeMode === 'system') {
            mediaQuery.addEventListener('change', handleSystemThemeChange);
        }

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [themeMode]);

    // Update data-theme attribute
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedMode);
        if (resolvedMode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [resolvedMode]);

    // Generate MUI theme
    const theme = generateTheme(themeColor, resolvedMode);

    const handleThemeChange = useCallback((color: string) => {
        setThemeColor(color);
    }, []);

    const handleModeChange = useCallback((mode: ThemeMode) => {
        setThemeMode(mode);
    }, []);

    // Update CSS variable for primary color
    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', themeColor);

        // Convert hex to rgb for opacity support in Tailwind
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
        };

        const rgb = hexToRgb(themeColor);
        if (rgb) {
            document.documentElement.style.setProperty('--primary-rgb', rgb);
        }
    }, [themeColor]);


    return (
        <>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <ThemeContext.Provider value={{
                            themeColor,
                            themeMode,
                            handleThemeChange,
                            handleModeChange,
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