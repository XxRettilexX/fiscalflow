import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Header } from "../components/Header";
import { Colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { useAuth } from "../context/AuthContext";

const SETTINGS_KEYS = {
    AUTO_LOGIN: "settings_auto_login",
    BIOMETRIC_LOGIN: "settings_biometric_login",
};

export default function ProfileScreen() {
    const { logout, user } = useAuth();
    const navigation = useNavigation();
    const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

    // --- State per le Impostazioni ---
    const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);

    // Carica solo le impostazioni
    const loadSettings = useCallback(async () => {
        setIsSettingsLoading(true);
        try {
            const autoLogin = await SecureStore.getItemAsync(SETTINGS_KEYS.AUTO_LOGIN);
            const biometricLogin = await SecureStore.getItemAsync(SETTINGS_KEYS.BIOMETRIC_LOGIN);
            const isAutoOn = autoLogin === "true";
            setIsAutoLoginEnabled(isAutoOn);
            setIsBiometricEnabled(isAutoOn && biometricLogin === "true");
        } catch (error) {
            console.error("Errore nel caricamento delle impostazioni:", error);
        } finally {
            setIsSettingsLoading(false);
        }
    }, []);

    useFocusEffect(loadSettings);

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
        <Modal
            animationType="slide"
            visible={isSettingsModalVisible}
            onRequestClose={() => setSettingsModalVisible(false)}
        >
            <View style={styles.container}>
                <Header title="Impostazioni" />
                <ScrollView contentContainerStyle={styles.content}>
                    {isSettingsLoading ? <ActivityIndicator size="large" color={Colors.primary} /> : (
                        <>
                            <Text style={styles.sectionTitle}>Accesso e Sicurezza</Text>
                            <View style={styles.settingRow}>
                                <Text style={styles.settingLabel}>Accesso Automatico</Text>
                                <Switch
                                    trackColor={{ false: Colors.surface, true: Colors.primary }}
                                    thumbColor={"white"}
                                    onValueChange={handleAutoLoginToggle}
                                    value={isAutoLoginEnabled}
                                />
                            </View>
                            <Text style={styles.settingDescription}>
                                Mantieni la sessione attiva per non dover inserire le credenziali ad ogni avvio.
                            </Text>
                            <View style={styles.separator} />
                            <View style={styles.settingRow}>
                                <Text style={[styles.settingLabel, !isAutoLoginEnabled && styles.disabledText]}>
                                    Accesso con Biometria
                                </Text>
                                <Switch
                                    trackColor={{ false: Colors.surface, true: Colors.primary }}
                                    thumbColor={"white"}
                                    onValueChange={handleBiometricToggle}
                                    value={isBiometricEnabled}
                                    disabled={!isAutoLoginEnabled}
                                />
                            </View>
                            <Text style={[styles.settingDescription, !isAutoLoginEnabled && styles.disabledText]}>
                                Usa il tuo volto o la tua impronta digitale per un accesso rapido. Richiede l'accesso automatico attivo.
                            </Text>

                            <Text style={styles.sectionTitle}>Accessibilità</Text>
                            <View style={styles.settingRow}>
                                <Text style={[styles.settingLabel, styles.disabledText]}>Testo più grande</Text>
                                <Switch value={false} disabled={true} />
                            </View>
                            <Text style={[styles.settingDescription, styles.disabledText]}>
                                Aumenta la dimensione del testo (prossimamente).
                            </Text>
                        </>
                    )}
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSettingsModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Chiudi</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );

    if (!user) {
        return (
            <View style={styles.container}>
                <Header title="Profilo" />
                <ActivityIndicator style={{ marginTop: 20 }} size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="Profilo" />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.profileName}>{user?.name}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => setSettingsModalVisible(true)}>
                        <Text style={styles.menuItemText}>Impostazioni</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Support")}>
                        <Text style={styles.menuItemText}>Supporto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate("About")}>
                        <Text style={styles.menuItemText}>Informazioni</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutButtonText}>Esci</Text>
                </TouchableOpacity>
            </ScrollView>
            {renderSettingsModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
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
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    avatarText: {
        color: "white",
        fontSize: 32,
        fontFamily: fonts.bold,
    },
    profileName: {
        fontSize: 22,
        fontFamily: fonts.bold,
        color: Colors.text,
    },
    profileEmail: {
        fontSize: 16,
        fontFamily: fonts.regular,
        color: Colors.text,
        opacity: 0.7,
    },
    menuContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 10,
        marginBottom: 20,
    },
    menuItem: {
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.bg,
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: Colors.text,
    },
    logoutButton: {
        backgroundColor: Colors.surface,
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
    },
    logoutButtonText: {
        color: Colors.danger,
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
        color: Colors.text,
        marginBottom: 20,
        marginTop: 10,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.surface,
        padding: 15,
        borderRadius: 10,
    },
    settingLabel: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: Colors.text,
    },
    settingDescription: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: Colors.text,
        opacity: 0.7,
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
});
