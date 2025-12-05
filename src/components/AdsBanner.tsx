import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../constants/fonts";
import { useSettings } from "../context/SettingsContext";
import { useSubscription } from "../context/SubscriptionContext";

export const AdsBanner = () => {
    const { hasFeature } = useSubscription();
    const { colors } = useSettings();

    if (hasFeature("no_ads")) return null;

    return (
        <View style={[styles.adsBanner, { backgroundColor: colors.primary }]}>
            <Text style={[styles.adsText, { color: colors.white }]}>
                📢 Passa a Premium per rimuovere gli annunci
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    adsBanner: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: "center",
    },
    adsText: {
        fontFamily: fonts.medium,
        fontSize: 14,
    },
});
