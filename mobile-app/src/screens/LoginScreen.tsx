import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { authService } from '../services/authService';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);
    const theme = useTheme();

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        try {
            const available = await authService.isBiometricEnabled();
            setIsBiometricAvailable(available);
        } catch (e) {
            console.log('Biometrics not available');
        }
    };

    const handleLogin = async () => {
        try {
            await dispatch(login({ email, password })).unwrap();
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    const handleBiometricLogin = async () => {
        const success = await authService.authenticateWithBiometric();
        if (success) {
            try {
                const user = await authService.getCurrentUser();
                if (user) {
                    dispatch(login({ email: user.email, password: 'stored_password_simulation' }));
                } else {
                    alert('Nenhum usuário registrado para biometria neste dispositivo.');
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.logoCircle}>
                    <MaterialCommunityIcons name="hospital-box" size={50} color="#fff" />
                </View>
                <Text variant="headlineLarge" style={styles.title}>Antigravity</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>Sua Saúde Digital Inteligente</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="email-outline" />}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                />

                <TextInput
                    label="Palavra-passe"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    left={<TextInput.Icon icon="lock-outline" />}
                    right={
                        <TextInput.Icon
                            icon={showPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowPassword(!showPassword)}
                        />
                    }
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                />

                {error && (
                    <Text style={styles.error}>{error}</Text>
                )}

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                >
                    Entrar
                </Button>

                {isBiometricAvailable && (
                    <View style={styles.biometricContainer}>
                        <Text variant="bodySmall" style={styles.orText}>OU</Text>
                        <IconButton
                            icon="fingerprint"
                            size={50}
                            iconColor={theme.colors.primary}
                            onPress={handleBiometricLogin}
                            style={styles.bioButton}
                        />
                        <Text variant="labelSmall" style={styles.bioLabel}>Entrar com Biometria</Text>
                    </View>
                )}

                <Button
                    mode="text"
                    onPress={() => navigation.navigate('Register')}
                    style={styles.linkButton}
                >
                    Não tem conta? Cadastre-se
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#0ea5e9',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    title: {
        marginTop: 15,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        marginTop: 5,
        color: '#64748b',
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    inputOutline: {
        borderRadius: 12,
    },
    button: {
        marginTop: 10,
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    biometricContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    orText: {
        color: '#94a3b8',
        marginBottom: 10,
    },
    bioButton: {
        margin: 0,
    },
    bioLabel: {
        color: '#64748b',
        marginTop: -5,
    },
    linkButton: {
        marginTop: 20,
    },
    error: {
        color: '#ef4444',
        marginBottom: 10,
        textAlign: 'center',
    },
});
