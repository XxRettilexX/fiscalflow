import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
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
import { Colors } from "../constants/colors";
import { fonts } from "../constants/fonts";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";

// --- Tipi per i dati ---
interface Transaction {
    id: string;
    category: string;
    amount: number;
    date: string;
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
const ProgressBar = ({ progress }) => (
    <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
);

// Componente per l'elemento della transazione
const TransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
        <View>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            <Text style={styles.transactionDate}>
                {new Date(item.date).toLocaleDateString()}
            </Text>
        </View>
        <Text
            style={[
                styles.transactionAmount,
                item.amount > 0 ? styles.income : styles.expense,
            ]}
        >
            {formatCurrency(item.amount)}
        </Text>
    </View>
);

export default function DashboardScreen() {
    const { token, user } = useAuth();
    const [summary, setSummary] = useState<SummaryData | null>(null);
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

            // Chiamata singola per ottenere tutti i dati della dashboard
            const data = await expensesApi.getDashboardSummary();

            setSummary({
                availableBalance: data.availableBalance,
                monthlyBudget: {
                    total: data.monthlyBudget,
                    used: data.usedBudget,
                },
            });
            setTransactions(data.recentTransactions);
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

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 10, color: Colors.text }}>
                    Caricamento...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const budgetProgress = summary
        ? (summary.monthlyBudget.used / summary.monthlyBudget.total) * 100
        : 0;

    return (
        <View style={styles.container}>
            <Header title="Dashboard" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.welcomeMessage}>Ciao, {user?.name || "Utente"}!</Text>

                <Card>
                    <Text style={styles.cardTitle}>Saldo Disponibile</Text>
                    <Text style={styles.balanceText}>
                        {formatCurrency(summary?.availableBalance ?? 0)}
                    </Text>
                </Card>

                <Card>
                    <View style={styles.budgetHeader}>
                        <Text style={styles.cardTitle}>Budget Mensile</Text>
                        <Text style={styles.budgetText}>
                            {formatCurrency(summary?.monthlyBudget.used ?? 0)} /{" "}
                            {formatCurrency(summary?.monthlyBudget.total ?? 0)}
                        </Text>
                    </View>
                    <ProgressBar progress={budgetProgress} />
                </Card>

                <Text style={styles.sectionTitle}>Ultime Transazioni</Text>
                <FlatList
                    data={transactions}
                    renderItem={({ item }) => <TransactionItem item={item} />}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false} // Disabilita lo scroll della FlatList interna
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    welcomeMessage: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: Colors.text,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: Colors.text,
        marginBottom: 8,
    },
    balanceText: {
        fontSize: 36,
        fontFamily: fonts.bold,
        color: Colors.primary,
    },
    budgetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    budgetText: {
        fontFamily: fonts.regular,
        color: Colors.text,
    },
    progressContainer: {
        height: 10,
        backgroundColor: Colors.bg,
        borderRadius: 5,
        overflow: "hidden",
        marginTop: 10,
    },
    progressBar: {
        height: "100%",
        backgroundColor: Colors.accent,
        borderRadius: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
        color: Colors.text,
        marginTop: 30,
        marginBottom: 15,
    },
    transactionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        backgroundColor: Colors.surface,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    transactionCategory: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: Colors.text,
    },
    transactionDate: {
        fontSize: 14,
        fontFamily: fonts.regular,
        color: Colors.text,
        opacity: 0.6,
    },
    transactionAmount: {
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    income: {
        color: Colors.accent,
    },
    expense: {
        color: Colors.danger,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.bg,
        marginVertical: 5,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.bg,
    },
    errorText: {
        color: Colors.danger,
        fontFamily: fonts.medium,
        fontSize: 16,
    },
});
