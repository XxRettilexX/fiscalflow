import { Colors } from "@constants/colors";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function ProfileModal({ visible, onClose }: Props) {
    const { user, logout } = useAuth();

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Profilo</Text>
                    <Text style={styles.label}>Nome</Text>
                    <Text style={styles.value}>{user?.name || "—"}</Text>

                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email || "—"}</Text>

                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Text style={styles.logoutText}>Disconnetti</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeText}>Chiudi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modal: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        width: "85%",
        elevation: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: Colors.primary,
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        color: Colors.textMuted,
    },
    value: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 10,
    },
    logoutBtn: {
        backgroundColor: Colors.danger,
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },
    logoutText: {
        color: Colors.white,
        textAlign: "center",
        fontWeight: "600",
    },
    closeBtn: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 8,
        marginTop: 15,
    },
    closeText: {
        color: Colors.white,
        textAlign: "center",
        fontWeight: "600",
    },
});
