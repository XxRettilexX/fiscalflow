import { Colors } from "@constants/colors";
import { RootStackParamList } from "@navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getToken } from "@services/biometric";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, StyleSheet, Text, View } from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "Splash">;

export default function SplashScreen() {
    const navigation = useNavigation<Nav>();
    const [showLogo, setShowLogo] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const textAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = async () => {
            // Step 1 — Animazione scritta "FiscalFlow"
            Animated.timing(textAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start(() => setShowLogo(true));

            // Step 2 — Logo fade-in
            if (showLogo) {
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }).start();
            }

            // Step 3 — Avvio autenticazione automatica
            setTimeout(() => handleAutoAuth(), 2800);
        };

        startAnimation();
    }, [showLogo]);

    const handleAutoAuth = async () => {
        try {
            const token = await getToken();

            if (token) {
                // FaceID/TouchID richiesto solo se esiste un token
                const bioAvailable = await LocalAuthentication.hasHardwareAsync();
                const savedBio = await LocalAuthentication.isEnrolledAsync();

                if (bioAvailable && savedBio) {
                    const res = await LocalAuthentication.authenticateAsync({
                        promptMessage: "Sblocca FiscalFlow",
                        fallbackLabel: "Usa PIN",
                    });

                    if (res.success) {
                        navigation.replace("Dashboard");
                    } else {
                        Alert.alert("Accesso annullato", "Autenticazione non riuscita");
                        navigation.replace("Login");
                    }
                } else {
                    navigation.replace("Dashboard");
                }
            } else {
                navigation.replace("Login");
            }
        } catch (err) {
            console.error(err);
            navigation.replace("Login");
        }
    };

    return (
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.container}>
            <Animated.Text
                style={[
                    styles.title,
                    {
                        opacity: textAnim,
                        transform: [
                            {
                                translateY: textAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                FiscalFlow
            </Animated.Text>

            {showLogo && (
                <Animated.View style={[styles.logoWrapper, { opacity: fadeAnim }]}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoLetter}>F</Text>
                    </View>
                </Animated.View>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: Colors.white,
        fontSize: 36,
        fontWeight: "800",
        letterSpacing: 1.2,
    },
    logoWrapper: {
        marginTop: 30,
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
    },
    logoLetter: {
        color: Colors.primaryDark,
        fontSize: 36,
        fontWeight: "900",
    },
});
