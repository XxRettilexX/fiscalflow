import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "../constants/themes";

type ThemeMode = "light" | "dark" | "system";
export const FONT_SCALES = { normal: 1, large: 1.2, largest: 1.4 };

interface SettingsContextType {
    theme: "light" | "dark";
    themeMode: ThemeMode;
    colors: typeof lightColors;
    fontScale: number;
    setThemeMode: (mode: ThemeMode) => void;
    setFontScale: (scale: number) => void;
    dynamicFontSize: (baseSize: number) => number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within a SettingsProvider");
    return context;
}

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const systemTheme = useColorScheme() ?? 'light';
    const [themeMode, setThemeMode] = useState<ThemeMode>('system');
    const [fontScale, setFontScale] = useState(FONT_SCALES.normal);

    useEffect(() => {
        const loadSettings = async () => {
            const storedThemeMode = await AsyncStorage.getItem("theme_mode") as ThemeMode | null;
            const storedFontScale = await AsyncStorage.getItem("font_scale");
            setThemeMode(storedThemeMode || 'system');
            setFontScale(storedFontScale ? parseFloat(storedFontScale) : FONT_SCALES.normal);
        };
        loadSettings();
    }, []);

    const handleSetThemeMode = useCallback(async (mode: ThemeMode) => {
        setThemeMode(mode);
        await AsyncStorage.setItem("theme_mode", mode);
    }, []);

    const handleSetFontScale = useCallback(async (scale: number) => {
        setFontScale(scale);
        await AsyncStorage.setItem("font_scale", String(scale));
    }, []);

    const dynamicFontSize = (baseSize: number) => baseSize * fontScale;

    const theme = themeMode === 'system' ? systemTheme : themeMode;
    const colors = theme === "light" ? lightColors : darkColors;

    return (
        <SettingsContext.Provider value={{ theme, themeMode, colors, fontScale, setThemeMode: handleSetThemeMode, setFontScale: handleSetFontScale, dynamicFontSize }}>
            {children}
        </SettingsContext.Provider>
    );
};
