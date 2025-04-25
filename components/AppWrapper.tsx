'use client';
import React, { createContext, useCallback, useMemo, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store, persistor } from '../store'
import { generateTheme } from '@/hoc/theme';

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
    const [themeColor, setThemeColor] = useState("#333333");
    const theme = generateTheme(themeColor);

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