import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Header } from "../components/Header";
import { Colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { useAuth } from "../context/AuthContext";
import { FONT_SCALES, useSettings } from "../context/SettingsContext";
import { RootStackParamList } from "../navigation/types";

const SETTINGS_KEYS = {
    AUTO_LOGIN: "settings_auto_login",
    BIOMETRIC_LOGIN: "settings_biometric_login",
};

export default function ProfileScreen() {
    const { logout, user, loading, refreshUser } = useAuth();
    const { colors, fontScale, setFontScale, themeMode, setThemeMode, dynamicFontSize } = useSettings();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

    // --- State per le Impostazioni Accesso ---
    const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Carica solo le impostazioni di accesso
    const openSettings = async () => {
        if (!user) return;
        setIsSettingsLoading(true);
        setSettingsModalVisible(true);
        try {
            // Carica impostazioni accesso
            const autoLogin = await SecureStore.getItemAsync(SETTINGS_KEYS.AUTO_LOGIN);
            const biometric = await SecureStore.getItemAsync(SETTINGS_KEYS.BIOMETRIC_LOGIN);
            const isAutoOn = autoLogin === "true";
            setIsAutoLoginEnabled(isAutoOn);
            setIsBiometricEnabled(isAutoOn && biometric === "true");
        } catch (e) {
            console.warn("Impossibile caricare le impostazioni:", e);
        } finally {
            setIsSettingsLoading(false);
        }
    };

    const handleAutoLoginToggle = async (value: boolean) => {
        setIsAutoLoginEnabled(value);
        await SecureStore.setItemAsync(SETTINGS_KEYS.AUTO_LOGIN, String(value));
        if (!value) {
            setIsBiometricEnabled(false);
            await SecureStore.setItemAsync(SETTINGS_KEYS.BIOMETRIC_LOGIN, "false");
        }
    };

    const handleBiometricToggle = async (value: boolean) => {
        setIsBiometricEnabled(value);
        await SecureStore.setItemAsync(SETTINGS_KEYS.BIOMETRIC_LOGIN, String(value));
    };

    const renderSettingsModal = () => (
        <Modal visible={isSettingsModalVisible} animationType="slide" onRequestClose={() => setSettingsModalVisible(false)}>
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Header title="Impostazioni" />
                <ScrollView contentContainerStyle={styles.content}>
                    {isSettingsLoading ? <ActivityIndicator size="large" color={colors.primary} /> : (
                        <>
                            {/* Sezione Accesso e Sicurezza */}
                            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(20) }]}>Accesso e Sicurezza</Text>
                            <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.settingLabel, { color: colors.text, fontSize: dynamicFontSize(16) }]}>Accesso Automatico</Text>
                                <Switch onValueChange={handleAutoLoginToggle} value={isAutoLoginEnabled} />
                            </View>
                            <Text style={[styles.settingDescription, { color: colors.text, fontSize: dynamicFontSize(14) }]}>
                                Mantieni la sessione attiva per non dover inserire le credenziali ad ogni avvio.
                            </Text>
                            <View style={styles.separator} />
                            <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.settingLabel, { color: colors.text, fontSize: dynamicFontSize(16) }, !isAutoLoginEnabled && styles.disabledText]}>Accesso con Biometria</Text>
                                <Switch onValueChange={handleBiometricToggle} value={isBiometricEnabled} disabled={!isAutoLoginEnabled} />
                            </View>
                            <Text style={[styles.settingDescription, { fontSize: dynamicFontSize(14) }, !isAutoLoginEnabled && styles.disabledText]}>
                                Usa il tuo volto o la tua impronta digitale per un accesso rapido. Richiede l'accesso automatico attivo.
                            </Text>

                            {/* Sezione Accessibilità */}
                            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(20) }]}>Accessibilità</Text>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Tema</Text>
                                <View style={[styles.fontScaleContainer, { backgroundColor: colors.surface }]}>
                                    <TouchableOpacity onPress={() => setThemeMode('light')} style={[styles.fontScaleButton, themeMode === 'light' && { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.fontScaleText, { color: colors.text }, themeMode === 'light' && { color: colors.white }]}>Chiaro</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setThemeMode('dark')} style={[styles.fontScaleButton, themeMode === 'dark' && { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.fontScaleText, { color: colors.text }, themeMode === 'dark' && { color: colors.white }]}>Scuro</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setThemeMode('system')} style={[styles.fontScaleButton, themeMode === 'system' && { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.fontScaleText, { color: colors.text }, themeMode === 'system' && { color: colors.white }]}>Sistema</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View>
                                <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Dimensione Testo</Text>
                                <View style={[styles.fontScaleContainer, { backgroundColor: colors.surface }]}>
                                    <TouchableOpacity onPress={() => setFontScale(FONT_SCALES.normal)} style={[styles.fontScaleButton, fontScale === FONT_SCALES.normal && { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.fontScaleText, { color: colors.text }, fontScale === FONT_SCALES.normal && { color: colors.white }]}>Normale</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setFontScale(FONT_SCALES.large)} style={[styles.fontScaleButton, fontScale === FONT_SCALES.large && { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.fontScaleText, { color: colors.text }, fontScale === FONT_SCALES.large && { color: colors.white }]}>Grande</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setFontScale(FONT_SCALES.largest)} style={[styles.fontScaleButton, fontScale === FONT_SCALES.largest && { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.fontScaleText, { color: colors.text }, fontScale === FONT_SCALES.largest && { color: colors.white }]}>Molto Grande</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>
                <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.primary }]} onPress={() => setSettingsModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Chiudi</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );

    // ... (logica di rendering per !user e user) ...
    // N.B.: Tutti gli stili che usano colori o font size ora dovrebbero essere dinamici
    // Esempio:
    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Header title="Profilo" />
                <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.primary} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Header title="Profilo" />
                <View style={{ padding: 20, alignItems: "center" }}>
                    <Text style={{ fontSize: dynamicFontSize(18), color: colors.text, marginBottom: 10 }}>
                        Impossibile caricare le informazioni del profilo.
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.7, textAlign: "center", marginBottom: 12, fontSize: dynamicFontSize(14) }}>
                        Verifica la connessione o riprova. Se il problema persiste esegui il logout e accedi di nuovo.
                    </Text>
                    {serverError ? (
                        <Text style={{ color: colors.danger, marginBottom: 12, textAlign: "center", fontSize: dynamicFontSize(14) }}>
                            {serverError}
                        </Text>
                    ) : null}

                    {isRetrying ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.closeButton, { marginBottom: 12, backgroundColor: colors.primary }]}
                                onPress={async () => {
                                    setServerError(null);
                                    setIsRetrying(true);
                                    try {
                                        const ok = await refreshUser();
                                        if (!ok) setServerError("Errore nel recupero del profilo dal server.");
                                    } catch (e: any) {
                                        setServerError(e?.message || "Errore durante il recupero del profilo.");
                                    } finally {
                                        setIsRetrying(false);
                                    }
                                }}
                            >
                                <Text style={styles.closeButtonText}>Riprova</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.logoutButton, { backgroundColor: colors.surface }]}
                                onPress={logout}
                            >
                                <Text style={[styles.logoutButtonText, { color: colors.danger }]}>Esci</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    }

    const displayName = user?.name ?? user?.email ?? "Utente";
    const avatarInitial = (displayName && displayName.length > 0) ? displayName.charAt(0).toUpperCase() : "?";

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <Header title="Profilo" />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.avatarText, { fontSize: dynamicFontSize(32) }]}>{avatarInitial}</Text>
                    </View>
                    <Text style={[styles.profileName, { color: colors.text, fontSize: dynamicFontSize(22) }]}>{displayName}</Text>
                    <Text style={[styles.profileEmail, { color: colors.text, fontSize: dynamicFontSize(16) }]}>{user?.email ?? ""}</Text>
                </View>

                <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.bg }]} onPress={() => navigation.navigate('Upgrade')}>
                        <Text style={[styles.menuItemText, { color: colors.accent, fontFamily: fonts.bold, fontSize: dynamicFontSize(16) }]}>🚀 Passa a Premium</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.bg }]} onPress={openSettings}>
                        <Text style={[styles.menuItemText, { color: colors.text, fontSize: dynamicFontSize(16) }]}>Impostazioni</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.bg }]} onPress={() => navigation.navigate("Support")}>
                        <Text style={[styles.menuItemText, { color: colors.text, fontSize: dynamicFontSize(16) }]}>Supporto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate("About")}>
                        <Text style={[styles.menuItemText, { color: colors.text, fontSize: dynamicFontSize(16) }]}>Informazioni</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface }]} onPress={logout}>
                    <Text style={[styles.logoutButtonText, { color: colors.danger, fontSize: dynamicFontSize(16) }]}>Esci</Text>
                </TouchableOpacity>
            </ScrollView>
            {renderSettingsModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor is now dynamic
    },
    content: {
        padding: 20,
    },
    profileHeader: {
        alignItems: "center",
        marginBottom: 30,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    avatarText: {
        color: "white",
        fontFamily: fonts.bold,
    },
    profileName: {
        fontFamily: fonts.bold,
    },
    profileEmail: {
        fontFamily: fonts.regular,
        opacity: 0.7,
    },
    menuContainer: {
        borderRadius: 10,
        marginBottom: 20,
    },
    menuItem: {
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    menuItemText: {
        fontFamily: fonts.medium,
    },
    logoutButton: {
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
    },
    logoutButtonText: {
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    sectionTitle: {
        fontFamily: fonts.bold,
        marginBottom: 20,
        marginTop: 20,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    settingLabel: {
        fontFamily: fonts.medium,
    },
    settingDescription: {
        fontFamily: fonts.regular,
        marginTop: 8,
        paddingHorizontal: 5,
        marginBottom: 15,
    },
    separator: {
        height: 15,
    },
    disabledText: {
        opacity: 0.4,
    },
    closeButton: {
        backgroundColor: Colors.primary,
        padding: 15,
        margin: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    closeButtonText: {
        color: "white",
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    inputLabel: {
        fontFamily: fonts.medium,
        marginBottom: 8,
    },
    fontScaleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 10,
        padding: 5,
    },
    fontScaleButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    fontScaleText: {
        fontFamily: fonts.medium,
    },
});
