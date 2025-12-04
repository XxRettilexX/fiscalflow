// src/screens/RegisterScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authApi } from '../api';
import { fonts } from '../constants/fonts';
import { useSettings } from '../context/SettingsContext';
import { AuthStackParamList } from '../navigation/types';

export default function RegisterScreen() {
    const { colors, dynamicFontSize } = useSettings();
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirm) {
            Alert.alert('Attenzione', 'Compila tutti i campi.');
            return;
        }
        if (password !== confirm) {
            Alert.alert('Errore', 'Le password non coincidono.');
            return;
        }

        try {
            setLoading(true);
            await authApi.register({ name, email, password });
            Alert.alert('Registrazione riuscita', 'Ora puoi accedere al tuo account.', [
                {
                    text: 'Accedi',
                    onPress: () => navigation.replace('Login'),
                },
            ]);
        } catch (err: any) {
            console.error("DETTAGLIO ERRORE REGISTRAZIONE:", err);
            Alert.alert('Errore di registrazione', err.message || 'Impossibile completare la registrazione');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.container}>
            <View style={styles.inner}>
                <Text style={[styles.title, { fontSize: dynamicFontSize(32) }]}>
                    Crea il tuo Account
                </Text>

                <TextInput
                    placeholder="Nome completo"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    style={[styles.input, { fontSize: dynamicFontSize(16), color: colors.white }]}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    style={[styles.input, { fontSize: dynamicFontSize(16), color: colors.white }]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    style={[styles.input, { fontSize: dynamicFontSize(16), color: colors.white }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    placeholder="Conferma password"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    style={[styles.input, { fontSize: dynamicFontSize(16), color: colors.white }]}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.accent }]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={[styles.buttonText, { fontSize: dynamicFontSize(16) }]}>
                            Registrati
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.replace('Login')}
                    style={{ marginTop: 24 }}
                >
                    <Text style={[styles.linkText, { color: colors.white, fontSize: dynamicFontSize(14) }]}>
                        Hai già un account?{' '}
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>
                            Accedi
                        </Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    inner: { padding: 24 },
    title: { color: 'white', fontFamily: fonts.bold, textAlign: 'center', marginBottom: 30 },
    input: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 10, padding: 15, marginBottom: 15, fontFamily: fonts.regular },
    button: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontFamily: fonts.bold },
    linkText: { textAlign: 'center', textDecorationLine: 'underline', fontFamily: fonts.regular }
});
