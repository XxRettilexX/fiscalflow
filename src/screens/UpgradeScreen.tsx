import { useNavigation } from "@react-navigation/native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { subscriptionApi } from "../api";
import { Header } from "../components/Header";
import { fonts } from "../constants/fonts";
import { useSettings } from "../context/SettingsContext";
import { useSubscription } from "../context/SubscriptionContext";

export default function UpgradeScreen() {
    const { colors, dynamicFontSize } = useSettings();
    const { plan, confirmUpgrade } = useSubscription();
    const { confirmPayment } = useStripe();
    const [isLoading, setIsLoading] = useState(false);
    const [cardDetails, setCardDetails] = useState<any>(null);
    const navigation = useNavigation();

    const handleCardPayment = async () => {
        console.log("💳 Avvio processo di pagamento con carta...");
        if (!cardDetails?.complete) {
            Alert.alert("Errore", "Per favore, inserisci i dati completi della carta.");
            return;
        }
        setIsLoading(true);
        try {
            // 1. Crea l'intento di pagamento sul backend
            const { clientSecret } = await subscriptionApi.createPaymentIntent();

            // 2. Conferma il pagamento con i dati della carta
            const { error, paymentIntent } = await confirmPayment(clientSecret, {
                paymentMethodType: 'Card',
            });

            if (error) {
                Alert.alert("Errore Pagamento", error.message);
                console.error("Errore durante il pagamento con Stripe:", error);
                setIsLoading(false);
                return;
            }

            // 3. Se il pagamento ha successo, finalizza l'abbonamento
            if (paymentIntent) {
                const success = await confirmUpgrade();
                if (success) {
                    Alert.alert("Successo!", "Sei passato a FiscalFlow Premium. Grazie!", [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                }
            }
        } catch (err: any) {
            Alert.alert("Errore", err.message || "Qualcosa è andato storto.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                <Header title="Passa a Premium" />
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.cardTitle, { color: colors.primary, fontSize: dynamicFontSize(24) }]}>🚀 FiscalFlow Premium</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.text, fontSize: dynamicFontSize(16) }]}>
                            Sblocca il pieno potenziale della gestione finanziaria.
                        </Text>

                        <View style={styles.featureList}>
                            <Text style={[styles.feature, { color: colors.text, fontSize: dynamicFontSize(16) }]}>✅ Esperienza senza pubblicità</Text>
                            <Text style={[styles.feature, { color: colors.text, fontSize: dynamicFontSize(16) }]}>✅ Scansione illimitata degli scontrini (OCR)</Text>
                            <Text style={[styles.feature, { color: colors.text, fontSize: dynamicFontSize(16) }]}>✅ Analisi avanzate e report mensili</Text>
                            <Text style={[styles.feature, { color: colors.text, fontSize: dynamicFontSize(16) }]}>✅ Esportazione dati in CSV ed Excel</Text>
                            <Text style={[styles.feature, { color: colors.text, fontSize: dynamicFontSize(16) }]}>✅ Supporto prioritario</Text>
                        </View>

                        {plan === 'premium' ? (
                            <View style={[styles.upgradeButton, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.upgradeButtonText, { fontSize: dynamicFontSize(18) }]}>Già Premium ✓</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={[styles.cardTitle, { color: colors.text, fontSize: dynamicFontSize(16), textAlign: 'left', marginBottom: 15, marginTop: 20 }]}>
                                    Paga con la carta
                                </Text>
                                <CardField
                                    postalCodeEnabled={false}
                                    onCardChange={(details) => setCardDetails(details)}
                                    style={[styles.cardField]}
                                    cardStyle={{
                                        backgroundColor: colors.surface,
                                        textColor: colors.text,
                                        borderWidth: 1,
                                        borderColor: colors.textMuted
                                    }}
                                />
                                <TouchableOpacity
                                    style={[styles.upgradeButton, { backgroundColor: colors.accent }]}
                                    onPress={handleCardPayment}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={[styles.upgradeButtonText, { fontSize: dynamicFontSize(18) }]}>
                                            Paga 5,99€
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={[styles.laterText, { color: colors.textMuted, fontSize: dynamicFontSize(14) }]}>Forse più tardi</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, justifyContent: 'center', flexGrow: 1 },
    card: {
        borderRadius: 15, padding: 25,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
    },
    cardTitle: { fontFamily: fonts.bold, marginBottom: 10, textAlign: 'center' },
    cardSubtitle: { fontFamily: fonts.regular, textAlign: 'center', marginBottom: 30, opacity: 0.8 },
    featureList: { alignSelf: 'flex-start', marginBottom: 30 },
    feature: { fontFamily: fonts.medium, marginBottom: 15 },
    upgradeButton: { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    upgradeButtonText: { color: 'white', fontFamily: fonts.bold },
    laterText: { textAlign: 'center', marginTop: 20, fontFamily: fonts.regular },
    cardField: {
        width: '100%',
        height: 50,
        marginVertical: 10,
    }
});
