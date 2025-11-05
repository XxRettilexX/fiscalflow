import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

/**
 * 🔐 Esegue l’autenticazione biometrica (FaceID / TouchID)
 */
export const performBiometricAuth = async () => {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware) {
            return { success: false, message: "Il dispositivo non supporta la biometria." };
        }

        if (!isEnrolled) {
            return { success: false, message: "Nessun volto o impronta registrata." };
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Autenticati per accedere a FiscalFlow",
            fallbackLabel: "Usa codice di sblocco",
            disableDeviceFallback: false,
            requireConfirmation: false,
        });

        return { success: result.success };
    } catch (e) {
        console.error("Errore biometrico:", e);
        return { success: false, message: "Errore di sistema durante l’autenticazione." };
    }
};

/**
 * 💾 Salva un token di sessione (JWT o simile)
 */
export const saveToken = async (token: string) => {
    try {
        await AsyncStorage.setItem("@fiscalflow_token", token);
    } catch (e) {
        console.error("Errore salvataggio token:", e);
    }
};

/**
 * 📥 Recupera il token salvato
 */
export const getToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("@fiscalflow_token");
    } catch (e) {
        console.error("Errore recupero token:", e);
        return null;
    }
};

/**
 * 🧹 Cancella il token (logout)
 */
export const clearToken = async () => {
    try {
        await AsyncStorage.removeItem("@fiscalflow_token");
    } catch (e) {
        console.error("Errore cancellazione token:", e);
    }
};
