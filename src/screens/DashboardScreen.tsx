import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { expensesApi } from "../api";
import { Card } from "../components/Card";
import { Header } from "../components/Header";
import { fonts } from "../constants/fonts";
import { useAuth } from "../context/AuthContext";
import { useBudget } from "../context/BudgetContext";
import { useSettings } from "../context/SettingsContext";
import { RootStackParamList } from "../navigation/types";
import { formatCurrency } from "../utils/formatCurrency";
import { getCategoryIcon } from "../utils/transactionIcons";

// --- Tipi per i dati ---
// Trasformiamo l'input API in questo formato interno
interface Transaction {
    id: string;
    category: string;
    amount: number;
    date: string; // ISO o stringa leggibile
}

// Componente per la barra di progresso
const ProgressBar = ({ progress }: { progress: number }) => {
    const { colors } = useSettings();
    return (
        <View style={[styles.progressContainer, { backgroundColor: colors.bg }]}>
            <View
                style={[
                    styles.progressBar,
                    { width: `${progress}%`, backgroundColor: colors.accent },
                ]}
            />
        </View>
    );
};

// Componente per l'elemento della transazione
const TransactionItem = ({ item, onPress }: { item: Transaction; onPress: () => void }) => {
    const { colors, dynamicFontSize } = useSettings();
    // Data stringa sicura
    const parsed = new Date(item.date);
    const dateText =
        !isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : String(item.date);
    const icon = getCategoryIcon(item.category);

    return (
        <TouchableOpacity style={[styles.transactionItem, { backgroundColor: colors.surface }]} onPress={onPress}>
            <View style={styles.transactionContent}>
                <Text style={styles.transactionIcon}>{icon}</Text>
                <View style={styles.transactionDetails}>
                    <Text
                        style={[
                            styles.transactionCategory,
                            { color: colors.text, fontSize: dynamicFontSize(16) },
                        ]}
                    >
                        {item.category}
                    </Text>
                    <Text
                        style={[
                            styles.transactionDate,
                            { color: colors.text, fontSize: dynamicFontSize(14) },
                        ]}
                    >
                        {dateText}
                    </Text>
                </View>
            </View>
            <Text
                style={[
                    styles.transactionAmount,
                    { fontSize: dynamicFontSize(16) },
                    item.amount < 0 ? { color: colors.danger } : { color: colors.accent },
                ]}
            >
                {formatCurrency(item.amount)}
            </Text>
        </TouchableOpacity>
    );
};

// Modale per i dettagli della transazione
const TransactionDetailModal = ({ transaction, visible, onClose }: { transaction: Transaction | null; visible: boolean; onClose: () => void }) => {
    const { colors, dynamicFontSize } = useSettings();
    if (!transaction) return null;

    const parsed = new Date(transaction.date);
    const dateText = !isNaN(parsed.getTime()) ? parsed.toLocaleDateString("it-IT", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : String(transaction.date);
    const icon = getCategoryIcon(transaction.category);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text, fontSize: dynamicFontSize(20) }]}>
                            Dettagli Transazione
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[styles.closeIcon, { fontSize: dynamicFontSize(24), color: colors.text }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.modalBody, { backgroundColor: colors.surface }]}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.largeIcon}>{icon}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Categoria</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontSize: dynamicFontSize(16) }]}>
                                {transaction.category}
                            </Text>
                        </View>

                        <View style={[styles.separator, { backgroundColor: colors.bg }]} />

                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Importo</Text>
                            <Text
                                style={[
                                    styles.detailValue,
                                    { fontSize: dynamicFontSize(18) },
                                    transaction.amount < 0 ? { color: colors.danger } : { color: colors.accent },
                                ]}
                            >
                                {formatCurrency(transaction.amount)}
                            </Text>
                        </View>

                        <View style={[styles.separator, { backgroundColor: colors.bg }]} />

                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>Data</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontSize: dynamicFontSize(16) }]}>
                                {dateText}
                            </Text>
                        </View>

                        <View style={[styles.separator, { backgroundColor: colors.bg }]} />

                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.text, fontSize: dynamicFontSize(14) }]}>ID Transazione</Text>
                            <Text style={[styles.detailValue, { color: colors.textMuted, fontSize: dynamicFontSize(14) }]}
                            >
                                {transaction.id}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.primary }]} onPress={onClose}>
                        <Text style={[styles.closeButtonText, { fontSize: dynamicFontSize(16) }]}>Chiudi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function DashboardScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { token, user } = useAuth();
    const { summary: budgetSummary, loading: budgetLoading } = useBudget();
    const { colors, dynamicFontSize } = useSettings();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    const fetchData = useCallback(async () => {
        if (!token) {
            setError("Token non disponibile.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Chiamata singola per ottenere i dati
            const data: any = await expensesApi.getDashboardSummary();

            // Usa solo il saldo e le transazioni dall'API
            setBalance(Number(data.availableBalance ?? 0) || 0);

            // Normalizza transazioni
            const rawTx: any[] = Array.isArray(data.recentTransactions)
                ? data.recentTransactions
                : data.recent_transactions ?? [];

            const mapped: Transaction[] = rawTx.map((t: any, idx: number) => {
                const id = String(t.id ?? t.transaction_id ?? idx);
                const category = t.category ?? t.customer_name ?? t.description ?? "Transazione";
                const amount = Number(t.total_amount ?? t.amount ?? 0) || 0;
                const date = t.issue_date ?? t.date ?? new Date().toISOString();
                return { id, category, amount, date };
            });

            setTransactions(mapped);
        } catch (e) {
            setError("Impossibile caricare i dati.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData]),
    );

    // Calcola le spese del mese corrente dalle transazioni
    const currentMonthExpenses = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions.reduce((total, tx) => {
            const txDate = new Date(tx.date);
            if (
                tx.amount < 0 &&
                txDate.getMonth() === currentMonth &&
                txDate.getFullYear() === currentYear
            ) {
                return total + Math.abs(tx.amount);
            }
            return total;
        }, 0);
    }, [transactions]);

    const isLoading = loading || budgetLoading;

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10, color: colors.text }}>
                    Caricamento...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.bg }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
        );
    }

    const monthlyBudgetTotal = budgetSummary.remainingAfterFixed;
    const budgetProgress = monthlyBudgetTotal > 0 ? (currentMonthExpenses / monthlyBudgetTotal) * 100 : 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Header title="Dashboard" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={[styles.welcomeMessage, { color: colors.text, fontSize: dynamicFontSize(24) }]}>
                    Ciao, {user?.name || "Utente"}!
                </Text>

                {/* Banner Premium */}
                <TouchableOpacity onPress={() => navigation.navigate("Upgrade")} style={[styles.premiumBanner, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.premiumBannerText, { fontSize: dynamicFontSize(16) }]}>🚀 Passa a Premium per sbloccare tutte le funzioni!</Text>
                </TouchableOpacity>

                <Card style={{ backgroundColor: colors.surface }}>
                    <Text style={[styles.cardTitle, { color: colors.text, fontSize: dynamicFontSize(16) }]}>
                        Saldo Disponibile
                    </Text>
                    <Text style={[styles.balanceText, { color: colors.primary, fontSize: dynamicFontSize(36) }]}>
                        {formatCurrency(balance)}
                    </Text>
                </Card>

                <Card style={{ backgroundColor: colors.surface }}>
                    <View style={styles.budgetHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text, fontSize: dynamicFontSize(16) }]}>
                            Budget Mensile (Rimanenza)
                        </Text>
                        <Text style={[styles.budgetText, { color: colors.text, fontSize: dynamicFontSize(14) }]}>
                            {formatCurrency(currentMonthExpenses)} /{" "}
                            {formatCurrency(monthlyBudgetTotal)}
                        </Text>
                    </View>
                    <ProgressBar progress={budgetProgress} />
                </Card>

                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: dynamicFontSize(20) }]}>
                    Ultime Transazioni
                </Text>
                <FlatList
                    data={transactions}
                    renderItem={({ item }) => (
                        <TransactionItem
                            item={item}
                            onPress={() => {
                                setSelectedTransaction(item);
                                setIsDetailModalVisible(true);
                            }}
                        />
                    )
                    }
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false} // Disabilita lo scroll della FlatList interna
                    ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.bg }]} />}
                />
            </ScrollView>

            <TransactionDetailModal
                transaction={selectedTransaction}
                visible={isDetailModalVisible}
                onClose={() => setIsDetailModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // Stili non dipendenti da tema/font
    container: {
        flex: 1,
    },
    scrollContainer: {
        padding: 20,
    },
    welcomeMessage: {
        fontFamily: fonts.bold,
        marginBottom: 20,
    },
    cardTitle: {
        fontFamily: fonts.medium,
        marginBottom: 8,
    },
    balanceText: {
        fontFamily: fonts.bold,
    },
    budgetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    budgetText: {
        fontFamily: fonts.regular,
    },
    progressContainer: {
        height: 10,
        borderRadius: 5,
        overflow: "hidden",
        marginTop: 10,
    },
    progressBar: {
        height: "100%",
        borderRadius: 5,
    },
    sectionTitle: {
        fontFamily: fonts.bold,
        marginTop: 30,
        marginBottom: 15,
    },
    transactionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    transactionContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    transactionIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionCategory: {
        fontFamily: fonts.medium,
    },
    transactionDate: {
        fontFamily: fonts.regular,
        opacity: 0.6,
        marginTop: 4,
    },
    transactionAmount: {
        fontFamily: fonts.bold,
    },
    separator: {
        height: 1,
        marginVertical: 5,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontFamily: fonts.medium,
    },
    premiumBanner: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    premiumBannerText: {
        color: 'white',
        fontFamily: fonts.bold,
    },
    // Stili per il modale
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: fonts.bold,
    },
    closeIcon: {
        fontFamily: fonts.bold,
    },
    modalBody: {
        marginHorizontal: 20,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    largeIcon: {
        fontSize: 60,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
    },
    detailLabel: {
        fontFamily: fonts.medium,
    },
    detailValue: {
        fontFamily: fonts.bold,
        textAlign: "right",
    },
    closeButton: {
        marginHorizontal: 20,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    closeButtonText: {
        color: "white",
        fontFamily: fonts.bold,
    },
    // Questi stili non sono più necessari qui, i colori vengono applicati dinamicamente
    income: {},
    expense: {},
});
