import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { expensesApi } from '../api';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Colors } from '../constants/colors';
import { API_URL } from '../constants/config'; // Ipotizziamo che l'URL base dell'API sia qui
import { fonts } from '../constants/fonts';

// Placeholder per un componente Select/Picker
const CategoryPicker = ({ selectedValue, onValueChange }) => (
    <View style={styles.pickerContainer}>
        <Text style={styles.label}>Categoria</Text>
        {/* In un'app reale, useresti un componente Dropdown/Modal Picker */}
        <Text style={styles.pickerText}>{selectedValue || 'Seleziona una categoria'}</Text>
    </View>
);

export default function AddExpenseScreen() {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Alimentari'); // Categoria di default
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const handleScanReceipt = async () => {
        // Richiesta dei permessi per la fotocamera
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permesso negato!", "Devi abilitare i permessi per la fotocamera per usare questa funzione.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.6,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            uploadImageForOCR(result.assets[0].uri);
        }
    };

    const uploadImageForOCR = async (uri: string) => {
        setIsLoading(true);
        const formData = new FormData();

        // @ts-ignore
        formData.append('receipt', {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            name: 'receipt.jpg',
            type: 'image/jpeg',
        });

        try {
            // Sostituisci con il tuo endpoint reale
            const response = await fetch(`${API_URL}/ocr/scan-receipt`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Aggiungi header di autenticazione se necessario
                },
            });

            if (!response.ok) {
                throw new Error('Errore durante la scansione dello scontrino.');
            }

            const data = await response.json();

            // Esempio di risposta attesa dal backend: { amount: "12.50", date: "2025-12-03" }
            if (data.amount) {
                setAmount(String(data.amount));
            }
            if (data.date) {
                setDate(data.date);
            }
            Alert.alert('Scontrino analizzato!', 'I dati sono stati pre-compilati.');

        } catch (error) {
            console.error(error);
            Alert.alert('Errore', 'Impossibile analizzare lo scontrino. Riprova.');
        } finally {
            setIsLoading(false);
        }
    };

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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Input
                    label="Importo"
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    icon="euros"
                />
                <CategoryPicker selectedValue={category} onValueChange={setCategory} />
                <Input
                    label="Data"
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    icon="calendar"
                />
                <Input
                    label="Note (Opzionale)"
                    placeholder="Es. Caffè con amici"
                    value={notes}
                    onChangeText={setNotes}
                    icon="document-text"
                />

                {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

                <Button
                    title="📸 Scansiona Scontrino"
                    onPress={handleScanReceipt}
                    variant="secondary"
                    isLoading={isLoading}
                />

                <View style={styles.spacer} />

                <Button
                    title="Aggiungi Spesa"
                    onPress={handleAddExpense}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
    scrollContainer: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: Colors.text,
        marginBottom: 8,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    pickerText: {
        backgroundColor: Colors.surface,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.bg,
        color: Colors.text,
        fontSize: 16,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    spacer: {
        height: 20,
    },
    content: {
        padding: 20,
    },
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
