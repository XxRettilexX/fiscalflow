// src/screens/RegisterScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authApi } from '../api';
import { Colors } from '../constants/colors';

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
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
            Alert.alert('Errore di registrazione', err.message || 'Impossibile completare la registrazione');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                padding: 24,
                backgroundColor: Colors.bg,
            }}
        >
            {/* Titolo e descrizione */}
            <Text
                style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: Colors.primary,
                    marginBottom: 16,
                }}
            >
                Crea un account
            </Text>
            <Text
                style={{
                    fontSize: 16,
                    color: Colors.textMuted,
                    marginBottom: 32,
                }}
            >
                Registrati su FiscalFlow per gestire in modo intelligente le tue finanze
            </Text>

            {/* Campi */}
            <TextInput
                placeholder="Nome completo"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 12,
                    borderRadius: 8,
                    color: Colors.text,
                    marginBottom: 12,
                    backgroundColor: Colors.surface,
                }}
            />
            <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 12,
                    borderRadius: 8,
                    color: Colors.text,
                    marginBottom: 12,
                    backgroundColor: Colors.surface,
                }}
            />
            <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 12,
                    borderRadius: 8,
                    color: Colors.text,
                    marginBottom: 12,
                    backgroundColor: Colors.surface,
                }}
            />
            <TextInput
                placeholder="Conferma password"
                placeholderTextColor="#999"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
                style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 12,
                    borderRadius: 8,
                    color: Colors.text,
                    marginBottom: 20,
                    backgroundColor: Colors.surface,
                }}
            />

            {/* Pulsante */}
            <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                style={{
                    backgroundColor: Colors.primary,
                    paddingVertical: 14,
                    borderRadius: 8,
                    alignItems: 'center',
                }}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 16 }}>
                        Registrati
                    </Text>
                )}
            </TouchableOpacity>

            {/* Link a login */}
            <TouchableOpacity
                onPress={() => navigation.replace('Login')}
                style={{ marginTop: 24 }}
            >
                <Text style={{ color: Colors.textMuted, textAlign: 'center', fontSize: 14 }}>
                    Hai già un account?{' '}
                    <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                        Accedi
                    </Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}
