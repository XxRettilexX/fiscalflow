import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { expensesApi } from "../api";
import { Header } from "../components/Header";
import { fonts } from "../constants/fonts";
import { useSettings } from "../context/SettingsContext";

export default function AddExpenseScreen() {
    const { colors, dynamicFontSize } = useSettings();
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const navigation = useNavigation();

    const handleAddExpense = async () => {
        if (!amount || !category || !date) {
            Alert.alert("Errore", "Importo, categoria e data sono obbligatori.");
            return;
        }
        try {
            setIsSaving(true);
            await expensesApi.create({
                // Assicura che l'importo sia sempre negativo
                amount: -Math.abs(parseFloat(amount)),
                category,
                date,
                notes,
            });
            Alert.alert("Successo", "Spesa aggiunta correttamente!");
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Errore", "Impossibile aggiungere la spesa: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <Header title="Aggiungi Spesa" />
            <View style={styles.content}>
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, fontSize: dynamicFontSize(16) }]} placeholder="Importo (€)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, fontSize: dynamicFontSize(16) }]} placeholder="Categoria (es. Alimentari)" value={category} onChangeText={setCategory} />
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, fontSize: dynamicFontSize(16) }]} placeholder="Data (YYYY-MM-DD)" value={date} onChangeText={setDate} />
                <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, fontSize: dynamicFontSize(16) }]} placeholder="Note (opzionale)" value={notes} onChangeText={setNotes} />
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleAddExpense} disabled={isSaving}>
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={[styles.buttonText, { fontSize: dynamicFontSize(16) }]}>Aggiungi Spesa</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    input: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontFamily: fonts.regular,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontFamily: fonts.bold,
    }
});
