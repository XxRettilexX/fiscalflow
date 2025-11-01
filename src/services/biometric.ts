import * as LocalAuthentication from "expo-local-authentication";

export const performBiometricAuth = async () => {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (!hasHardware) {
            return { success: false, message: "Il dispositivo non supporta la biometria." };
        }

        if (!isEnrolled) {
            return { success: false, message: "Nessun volto o impronta registrata." };
        }

        type ExtendedAuthResult = {
            success: boolean;
            error?: string;
            warning?: string;
        };

        const result = (await LocalAuthentication.authenticateAsync({
            promptMessage: "Autenticati per accedere a FiscalFlow",
            fallbackLabel: "Usa codice di sblocco",
            disableDeviceFallback: false,
            requireConfirmation: false,
            promptDescription: "Sicurezza rapida e affidabile",
        })) as ExtendedAuthResult;


        if (result.success) {
            return { success: true };
        } else {
            // Rileva errori noti (dalla doc)
            switch (result.error) {
                case "lockout":
                    return { success: false, message: "Troppi tentativi falliti. Sblocca il dispositivo e riprova." };
                case "not_enrolled":
                    return { success: false, message: "Nessuna impronta o volto registrato." };
                case "not_available":
                    return { success: false, message: "Autenticazione non disponibile su questo dispositivo." };
                case "user_cancel":
                case "system_cancel":
                    return { success: false, message: "Autenticazione annullata." };
                default:
                    return { success: false, message: "Autenticazione non riuscita. Riprova." };
            }
        }
    } catch (e) {
        console.log("Errore biometrico:", e);
        return { success: false, message: "Errore di sistema durante l’autenticazione." };
    }
};
