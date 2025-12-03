import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";
import { expensesApi } from "../api";
import { Header } from "../components/Header";
import { Colors } from "../constants/colors";
import { fonts } from "../constants/fonts";

export default function AddExpenseScreen() {
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [notes, setNotes] = useState("");
    const navigation = useNavigation();

    const handleAddExpense = async () => {
        if (!amount || !category || !date) {
            Alert.alert("Errore", "Importo, categoria e data sono obbligatori.");
            return;
        }
        try {
            await expensesApi.create({
                amount: parseFloat(amount),
                category,
                date,
                notes,
            });
            Alert.alert("Successo", "Spesa aggiunta correttamente!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Errore", "Impossibile aggiungere la spesa: " + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Aggiungi Spesa" />
            <View style={styles.content}>
                <TextInput style={styles.input} placeholder="Importo (€)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Categoria (es. Alimentari)" value={category} onChangeText={setCategory} />
                <TextInput style={styles.input} placeholder="Data (YYYY-MM-DD)" value={date} onChangeText={setDate} />
                <TextInput style={styles.input} placeholder="Note (opzionale)" value={notes} onChangeText={setNotes} />
                <Button title="Aggiungi Spesa" onPress={handleAddExpense} color={Colors.primary} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    content: { padding: 20 },
    input: {
        backgroundColor: Colors.surface,
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        fontFamily: fonts.regular,
        color: Colors.text,
    },
});
