import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

/**
 * Verifica se il dispositivo supporta la biometria
 */
export const checkBiometricAvailability = async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
};

/**
 * Rileva il tipo di biometria disponibile
 */
export const getBiometricType = async (): Promise<
    "fingerprint" | "face" | "iris" | "none"
> => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT))
        return "fingerprint";
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION))
        return "face";
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return "iris";
    return "none";
};

/**
 * 🔒 Richiede l’autorizzazione biometrica (Face ID o impronta)
 * Usa un controllo per evitare errori su versioni Expo precedenti.
 */
export const requestBiometricPermission = async (): Promise<boolean> => {
    try {
        // controlla se l’API esiste nella versione corrente
        if (typeof (LocalAuthentication as any).requestPermissionsAsync === "function") {
            const result = await (LocalAuthentication as any).requestPermissionsAsync();
            return result.granted;
        }

        // fallback per versioni precedenti di Expo
        return await LocalAuthentication.hasHardwareAsync();
    } catch {
        return false;
    }
};

/**
 * Esegue l’autenticazione biometrica
 */
export const authenticateBiometric = async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autenticati per accedere a FiscalFlow",
        fallbackLabel: "Usa codice di sblocco",
        disableDeviceFallback: true,
        requireConfirmation: false,
    });
    return result.success;
};

/**
 * Salva e recupera token in modo sicuro
 */
export const saveToken = async (token: string) => {
    await SecureStore.setItemAsync("fiscalflow_token", token);
};

export const getToken = async () => {
    return await SecureStore.getItemAsync("fiscalflow_token");
};

export const clearToken = async () => {
    await SecureStore.deleteItemAsync("fiscalflow_token");
};
