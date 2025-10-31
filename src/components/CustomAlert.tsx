import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CustomAlert({ visible, title, message, onClose }) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
    box: { backgroundColor: "#fff", padding: 20, borderRadius: 16, width: "80%", alignItems: "center" },
    title: { fontSize: 18, fontWeight: "700", color: "#1A4C8B", marginBottom: 10 },
    message: { textAlign: "center", color: "#5D6D7E", marginBottom: 16 },
    button: { backgroundColor: "#2ECC71", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
    buttonText: { color: "#fff", fontWeight: "600" },
});
