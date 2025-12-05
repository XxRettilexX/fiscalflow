import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { expensesApi } from "../api";
import { Header } from "../components/Header";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import { fonts } from "../constants/fonts";
import { useSettings } from "../context/SettingsContext";
import { getCategoryIcon } from "../utils/transactionIcons";

export default function AddExpenseScreen() {
    const { colors, dynamicFontSize } = useSettings();
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const navigation = useNavigation();

    const handleAddExpense = async () => {
        if (!amount || !category || !date) {
            Alert.alert("Errore", "Importo, categoria e data sono obbligatori.");
            return;
        }
        try {
            setIsSaving(true);
            await expensesApi.create({
                amount: -Math.abs(parseFloat(amount)),
                category,
                date,
                notes,
            });
            Alert.alert("Successo", "Spesa aggiunta correttamente!");
            setAmount("");
            setCategory(EXPENSE_CATEGORIES[0]);
            setDate(new Date().toISOString().split('T')[0]);
            setNotes("");
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Errore", "Impossibile aggiungere la spesa: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const requestCameraAccess = async () => {
        if (!cameraPermission?.granted) {
            const permission = await requestCameraPermission();
            if (!permission.granted) {
                Alert.alert("Permesso negato", "È necessario il permesso della fotocamera.");
                return;
            }
        }
        setIsCameraVisible(true);
    };

    const takePicture = async () => {
        if (!cameraRef.current) {
            Alert.alert("Errore", "Fotocamera non disponibile.");
            return;
        }

        try {
            const photo = await cameraRef.current.takePictureAsync();
            setIsCameraVisible(false);
            Alert.alert("Foto catturata", "La funzionalità OCR è in sviluppo. Per ora puoi compilare manualmente i dati.");
        } catch (error) {
            Alert.alert("Errore", "Impossibile scattare la foto.");
        }
    };

    // Schermata della fotocamera
    if (isCameraVisible && cameraPermission?.granted) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <CameraView style={styles.cameraFull} ref={cameraRef} facing="back">
                    {/* Overlay scuro superiore e inferiore */}
                    <View style={styles.cameraOverlayTop} />

                    {/* Pulsanti in basso */}
                    <View style={styles.cameraButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.cameraActionButton, { backgroundColor: colors.danger }]}
                            onPress={() => setIsCameraVisible(false)}
                        >
                            <Text style={[styles.cameraActionButtonText, { fontSize: dynamicFontSize(16) }]}>Annulla</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cameraShutterButton, { backgroundColor: colors.primary }]}
                            onPress={takePicture}
                        >
                            <Text style={styles.cameraShutterText}>📸</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cameraActionButton, { backgroundColor: colors.primary }]}
                            onPress={takePicture}
                        >
                            <Text style={[styles.cameraActionButtonText, { fontSize: dynamicFontSize(16) }]}>Scatta</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Header title="Aggiungi Spesa" />
            <ScrollView style={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(16) }]}>Inserisci Manualmente</Text>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Importo (€)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, fontSize: dynamicFontSize(16) }]}
                        placeholder="0.00"
                        placeholderTextColor={colors.textMuted}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Categoria</Text>
                    <TouchableOpacity
                        style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                        onPress={() => setIsPickerVisible(true)}
                    >
                        <Text style={[styles.pickerButtonText, { color: colors.text, fontSize: dynamicFontSize(16) }]}
                        >
                            {getCategoryIcon(category)} {category}
                        </Text>
                    </TouchableOpacity>

                    <Modal visible={isPickerVisible} transparent animationType="fade" onRequestClose={() => setIsPickerVisible(false)}>
                        <View style={styles.pickerOverlay}>
                            <View style={[styles.pickerModal, { backgroundColor: colors.bg }]}>
                                <View style={styles.pickerHeader}>
                                    <Text style={[styles.pickerTitle, { color: colors.text, fontSize: dynamicFontSize(18) }]}>Seleziona Categoria</Text>
                                    <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                                        <Text style={[styles.closePickerButton, { color: colors.text, fontSize: dynamicFontSize(18) }]}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={EXPENSE_CATEGORIES}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.pickerItem, { backgroundColor: category === item ? colors.primary : colors.surface }]}
                                            onPress={() => {
                                                setCategory(item);
                                                setIsPickerVisible(false);
                                            }}
                                        >
                                            <Text style={[styles.pickerItemText, { color: category === item ? colors.white : colors.text, fontSize: dynamicFontSize(16) }]}>
                                                {getCategoryIcon(item)} {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item) => item}
                                    scrollEnabled={true}
                                    nestedScrollEnabled={true}
                                />
                            </View>
                        </View>
                    </Modal>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Data</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, fontSize: dynamicFontSize(16) }]}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.textMuted}
                        value={date}
                        onChangeText={setDate}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Note (opzionale)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, fontSize: dynamicFontSize(16), minHeight: 80 }]}
                        placeholder="Aggiungi una nota..."
                        placeholderTextColor={colors.textMuted}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </View>

                <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleAddExpense} disabled={isSaving}>
                    {isSaving ? <ActivityIndicator color="white" /> : <Text style={[styles.buttonText, { fontSize: dynamicFontSize(16) }]}>Aggiungi Spesa</Text>}
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(16), marginTop: 30 }]}>Scansiona Scontrino</Text>

                <TouchableOpacity style={[styles.scanButton, { backgroundColor: colors.accent }]} onPress={requestCameraAccess}>
                    <Text style={[styles.scanButtonText, { fontSize: dynamicFontSize(16) }]}>📸 Scansiona Scontrino</Text>
                </TouchableOpacity>
                <Text style={[styles.scanDescription, { color: colors.text, fontSize: dynamicFontSize(12) }]}>
                    Scatta una foto del tuo scontrino. La funzionalità OCR è in sviluppo.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    sectionTitle: { fontFamily: fonts.bold, marginBottom: 15, marginTop: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontFamily: fonts.medium, marginBottom: 8 },
    input: { padding: 15, borderRadius: 10, marginBottom: 0, fontFamily: fonts.regular },
    pickerButton: { padding: 15, borderRadius: 10, borderWidth: 1, justifyContent: 'center' },
    pickerButtonText: { fontFamily: fonts.medium },
    button: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontFamily: fonts.bold },
    scanButton: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    scanButtonText: { color: 'white', fontFamily: fonts.bold },
    scanDescription: { fontFamily: fonts.regular, marginTop: 8, marginBottom: 40, textAlign: 'center', opacity: 0.7 },

    // Stili fotocamera
    cameraFull: { flex: 1 },
    cameraOverlayTop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
    cameraButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    cameraActionButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    cameraActionButtonText: { color: 'white', fontFamily: fonts.bold },
    cameraShutterButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    cameraShutterText: { fontSize: 32 },

    // Stili picker
    pickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    pickerModal: { maxHeight: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
    pickerTitle: { fontFamily: fonts.bold },
    closePickerButton: { fontFamily: fonts.bold },
    pickerItem: { padding: 15, borderRadius: 10, marginHorizontal: 10, marginVertical: 5 },
    pickerItemText: { fontFamily: fonts.medium },
});
