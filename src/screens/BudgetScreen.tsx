import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Header } from "../components/Header";
import { Colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { useBudget } from "../context/BudgetContext";
import { useSettings } from "../context/SettingsContext";
import { RootStackParamList } from "../navigation/types";
import { formatCurrency } from "../utils/formatCurrency";

export default function BudgetScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { settings: contextSettings, summary, loading, saveSettings, loadSettings } = useBudget();
    const { colors, dynamicFontSize } = useSettings();
    const [settings, setSettings] = useState(contextSettings);

    useFocusEffect(
        useCallback(() => {
            loadSettings();
        }, [loadSettings])
    );

    // Sincronizza lo stato locale quando il contesto cambia
    useEffect(() => {
        setSettings(contextSettings);
    }, [contextSettings]);


    const handleSettingChange = (field: keyof typeof settings, value: string) => {
        if (/^\d*\.?\d*$/.test(value)) {
            setSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Header title="Il Tuo Budget" />
                <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <Header title="Il Tuo Budget" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.pageTitle, { color: colors.text, fontSize: dynamicFontSize(22) }]}>Definisci il tuo Piano</Text>
                <Text style={[styles.pageSubtitle, { color: colors.text, fontSize: dynamicFontSize(14) }]}>
                    L'app farà i calcoli per te. Rispondi a queste domande per iniziare.
                </Text>

                {/* Riepilogo Automatico */}
                <View style={[styles.summaryBox, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text }]}>Spese Fisse Mensili:</Text>
                        <Text style={[styles.summaryValue, { color: colors.text, fontSize: dynamicFontSize(16) }]}>{formatCurrency(summary.totalFixedMonthly)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text }]}>Rimanenza per il mese:</Text>
                        <Text style={[styles.summaryValue, { color: colors.text, fontSize: dynamicFontSize(16) }]}>{formatCurrency(summary.remainingAfterFixed)}</Text>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Qual è la tua entrata mensile totale? (€)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.monthlyIncome}
                        onChangeText={(v) => handleSettingChange('monthlyIncome', v)}
                        keyboardType="decimal-pad"
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(18) }]}>Spese Fisse</Text>

                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Affitto o Mutuo (mensile)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.rentOrMortgage}
                        onChangeText={(v) => handleSettingChange('rentOrMortgage', v)}
                        keyboardType="decimal-pad"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Bollette (stima mensile)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.utilities}
                        onChangeText={(v) => handleSettingChange('utilities', v)}
                        keyboardType="decimal-pad"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Abbonamenti (Netflix, Spotify, etc.) (totale mensile)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.subscriptions}
                        onChangeText={(v) => handleSettingChange('subscriptions', v)}
                        keyboardType="decimal-pad"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Assicurazione Auto (costo annuale)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.carInsurance}
                        onChangeText={(v) => handleSettingChange('carInsurance', v)}
                        keyboardType="decimal-pad"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Altre spese fisse (totale mensile)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.otherFixed}
                        onChangeText={(v) => handleSettingChange('otherFixed', v)}
                        keyboardType="decimal-pad"
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(18) }]}>Pianifica Spese Variabili</Text>
                <Text style={[styles.pageSubtitle, { color: colors.text, fontSize: dynamicFontSize(14) }]}>
                    Usa la rimanenza per pianificare le tue spese settimanali e mensili.
                </Text>

                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Quanto spendi in media a settimana per la spesa alimentare?</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.weeklyGroceries}
                        onChangeText={(v) => handleSettingChange('weeklyGroceries', v)}
                        keyboardType="decimal-pad"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Quanto prevedi per uscite settimanali? (ristoranti, bar, etc.)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.weeklyEntertainment}
                        onChangeText={(v) => handleSettingChange('weeklyEntertainment', v)}
                        keyboardType="decimal-pad"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Budget mensile per Shopping e altro</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.monthlyShopping}
                        onChangeText={(v) => handleSettingChange('monthlyShopping', v)}
                        keyboardType="decimal-pad"
                    />
                </View>

                {/* Riepilogo Risparmio */}
                <View style={[styles.summaryBox, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text }]}>Totale Spese Variabili Pianificate:</Text>
                        <Text style={[styles.summaryValue, { color: colors.danger, fontSize: dynamicFontSize(16) }]}>{formatCurrency(summary.totalVariable)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.text }]}>Risparmio Mensile Previsto:</Text>
                        <Text style={[styles.summaryValue, { color: colors.accent, fontSize: dynamicFontSize(16) }]}>{formatCurrency(summary.finalSavings)}</Text>
                    </View>
                </View>


                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(18) }]}>Obiettivo di Risparmio</Text>

                <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Quanto vorresti risparmiare ogni mese? (€)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={settings.savingsGoal}
                        onChangeText={(v) => handleSettingChange('savingsGoal', v)}
                        keyboardType="decimal-pad"
                    />
                </View>

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={() => saveSettings(settings)}>
                    <Text style={[styles.saveButtonText, { color: 'white', fontSize: dynamicFontSize(16) }]}>Salva Impostazioni</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Upgrade')} style={styles.upgradeSection}>
                    <Text style={[styles.upgradeText, { color: colors.text, fontSize: dynamicFontSize(14) }]}>
                        Vuoi un'analisi più dettagliata? <Text style={{ color: colors.primary, fontFamily: fonts.bold }}>Passa a Premium.</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
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
    pageTitle: {
        fontSize: 22,
        fontFamily: fonts.bold,
        color: Colors.text,
        marginBottom: 8,
    },
    pageSubtitle: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: Colors.text,
        opacity: 0.7,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: Colors.text,
        marginTop: 20,
        marginBottom: 15,
        borderTopWidth: 1,
        borderTopColor: Colors.surface,
        paddingTop: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: Colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.surface,
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        color: Colors.text,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    upgradeSection: {
        marginTop: 30,
        padding: 15,
        alignItems: 'center',
    },
    upgradeText: {
        textAlign: 'center',
        opacity: 0.8,
    },
    // Nuovi stili per il riepilogo
    summaryBox: {
        backgroundColor: Colors.surface,
        borderRadius: 10,
        padding: 15,
        marginBottom: 30,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
    },
    summaryLabel: {
        fontFamily: fonts.regular,
        color: Colors.text,
        opacity: 0.8,
    },
    summaryValue: {
        fontFamily: fonts.bold,
        color: Colors.text,
        fontSize: 16,
    }
});
