import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const Colors = {
    primary: "#1B4B96",
    primaryDark: "#0F2E60",
    accent: "#2CC2A6",
    white: "#FFFFFF",
    bg: "#F4F6FA",
};

const { width, height } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = { onFinish: (goTo: "login" | "dashboard") => void };

export default function SplashScreen({ onFinish }: Props) {
    const [displayText, setDisplayText] = useState("");
    const fullText = "FiscalFlow";

    const strokeOffset1 = useSharedValue(260);
    const strokeOffset2 = useSharedValue(260);
    const strokeOffset3 = useSharedValue(260);
    const logoScale = useSharedValue(0.85);
    const logoOpacity = useSharedValue(0);
    const fadeOut = useSharedValue(0);

    const aWave1 = useAnimatedProps(() => ({
        strokeDashoffset: strokeOffset1.value,
        opacity: logoOpacity.value,
    }));
    const aWave2 = useAnimatedProps(() => ({
        strokeDashoffset: strokeOffset2.value,
        opacity: logoOpacity.value,
    }));
    const aWave3 = useAnimatedProps(() => ({
        strokeDashoffset: strokeOffset3.value,
        opacity: logoOpacity.value,
    }));

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const fadeAnimatedStyle = useAnimatedStyle(() => ({
        opacity: 1 - fadeOut.value,
    }));

    useEffect(() => {
        // Effetto digitazione "FiscalFlow"
        let i = 0;
        const interval = setInterval(() => {
            setDisplayText(fullText.slice(0, i + 1));
            i++;
            if (i === fullText.length) clearInterval(interval);
        }, 120);

        fadeOut.value = withDelay(2000, withTiming(1, { duration: 700 }));
        logoOpacity.value = withDelay(1800, withTiming(1, { duration: 300 }));
        strokeOffset1.value = withDelay(1900, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
        strokeOffset2.value = withDelay(2100, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
        strokeOffset3.value = withDelay(2300, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
        logoScale.value = withDelay(
            3200,
            withSequence(
                withTiming(1.05, { duration: 300 }),
                withSpring(1, { damping: 12, stiffness: 120, mass: 0.4 })
            )
        );

        // Dopo l'animazione → avvia controllo token/biometria
        const total = 4200;
        const t = setTimeout(() => handleAutoAuth(), total + 300);

        return () => {
            clearInterval(interval);
            clearTimeout(t);
        };
    }, []);

    async function handleAutoAuth() {
        const token = await SecureStore.getItemAsync("fiscalflow_token");

        if (!token) {
            onFinish("login");
            return;
        }

        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                onFinish("dashboard");
                return;
            }

            const res = await LocalAuthentication.authenticateAsync({
                promptMessage: "Autenticazione biometrica FiscalFlow",
                fallbackLabel: "Usa codice",
                cancelLabel: "Annulla",
            });

            if (res.success) onFinish("dashboard");
            else {
                Alert.alert("Accesso annullato", "Autenticazione non riuscita");
                onFinish("login");
            }
        } catch (err) {
            console.error(err);
            onFinish("login");
        }
    }

    const svgW = width;
    const svgH = height * 0.45;
    const wave1 = "M 20 80 C 90 30, 180 30, 250 80";
    const wave2 = "M 35 110 C 110 60, 200 60, 275 110";
    const wave3 = "M 50 140 C 130 95, 220 95, 300 140";

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.gradient}>
                <Animated.View style={[styles.textWrap, fadeAnimatedStyle]}>
                    <Text style={styles.titleText}>{displayText}</Text>
                </Animated.View>

                <Animated.View style={[styles.svgContainer, logoAnimatedStyle]}>
                    <Svg width={svgW} height={svgH} viewBox="0 0 360 200">
                        <AnimatedPath animatedProps={aWave1} d={wave1} stroke={Colors.white} strokeWidth={6} strokeLinecap="round" fill="none" strokeDasharray="260" />
                        <AnimatedPath animatedProps={aWave2} d={wave2} stroke={Colors.accent} strokeWidth={6} strokeLinecap="round" fill="none" strokeDasharray="260" />
                        <AnimatedPath animatedProps={aWave3} d={wave3} stroke={Colors.white} strokeWidth={6} strokeLinecap="round" fill="none" strokeDasharray="260" />
                    </Svg>
                </Animated.View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    gradient: { flex: 1, alignItems: "center", justifyContent: "center" },
    textWrap: { position: "absolute", top: "45%" },
    titleText: { fontSize: 32, fontWeight: "800", color: Colors.white, letterSpacing: 1 },
    svgContainer: { position: "absolute", top: "38%", alignItems: "center", justifyContent: "center" },
});
