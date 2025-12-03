import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { expensesApi } from "../api";
import { Card } from "../components/Card";
import { Header } from "../components/Header";
import { fonts } from "../constants/fonts";
import { useAuth } from "../context/AuthContext";
import { useBudget } from "../context/BudgetContext";
import { useSettings } from "../context/SettingsContext";
import { formatCurrency } from "../utils/formatCurrency";

// --- Tipi per i dati ---
// Trasformiamo l'input API in questo formato interno
interface Transaction {
    id: string;
    category: string;
    amount: number;
    date: string; // ISO o stringa leggibile
}

interface Budget {
    total: number;
    used: number;
}

interface SummaryData {
    availableBalance: number;
    monthlyBudget: Budget;
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
const TransactionItem = ({ item }: { item: Transaction }) => {
    const { colors, dynamicFontSize } = useSettings();
    // Data stringa sicura
    const parsed = new Date(item.date);
    const dateText =
        !isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : String(item.date);

    return (
        <View style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
            <View>
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
            <Text
                style={[
                    styles.transactionAmount,
                    { fontSize: dynamicFontSize(16) },
                    item.amount < 0 ? { color: colors.danger } : { color: colors.accent },
                ]}
            >
                {formatCurrency(item.amount)}
            </Text>
        </View>
    );
};

export default function DashboardScreen() {
    const { token, user } = useAuth();
    const { summary: budgetSummary, loading: budgetLoading } = useBudget();
    const { colors, dynamicFontSize } = useSettings();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    renderItem={({ item }) => <TransactionItem item={item} />}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false} // Disabilita lo scroll della FlatList interna
                    ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.bg }]} />}
                />
            </ScrollView>
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
    transactionCategory: {
        fontFamily: fonts.medium,
    },
    transactionDate: {
        fontFamily: fonts.regular,
        opacity: 0.6,
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
    // Questi stili non sono più necessari qui, i colori vengono applicati dinamicamente
    income: {},
    expense: {},
});
