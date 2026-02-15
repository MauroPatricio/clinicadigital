import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, TextInput, Button, ProgressBar, HelperText, Portal, Modal, Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { authService } from '../services/authService';
import { login } from '../store/slices/authSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RegisterScreen({ navigation }: any) {
    const dispatch = useDispatch<AppDispatch>();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        documentId: '',
        allergies: '',
        preExistingConditions: '',
        insuranceProvider: '',
        insuranceNumber: '',
    });

    const [otp, setOtp] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSendOtp = () => {
        if (!formData.phone) return;
        setLoading(true);
        // Simulate OTP send
        setTimeout(() => {
            setLoading(false);
            setShowOtpModal(true);
            setOtp('123456'); // Simulated OTP
        }, 1500);
    };

    const handleVerifyOtp = () => {
        setShowOtpModal(false);
        setStep(2);
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const user = await authService.register({
                ...formData,
                role: 'patient',
                profile: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                },
                clinicalHistory: {
                    allergies: formData.allergies.split(',').map(s => s.trim()),
                    preExistingConditions: formData.preExistingConditions.split(',').map(s => s.trim()),
                },
                insurance: {
                    provider: formData.insuranceProvider,
                    policyNumber: formData.insuranceNumber
                }
            });
            dispatch(login(user));
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.stepTitle}>Validação de Telefone</Text>
            <Text variant="bodyMedium" style={styles.stepDescription}>
                Insira o seu número de telefone para receber um código de validação.
            </Text>
            <TextInput
                label="Número de Telefone"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                mode="outlined"
                left={<TextInput.Icon icon="phone" />}
                style={styles.input}
            />
            <Button
                mode="contained"
                onPress={handleSendOtp}
                loading={loading}
                disabled={loading || !formData.phone}
                style={styles.button}
            >
                Enviar Código
            </Button>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.stepTitle}>Dados Pessoais</Text>
            <TextInput
                label="Nome"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Apelido"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Palavra-passe"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="BI / Documento de Identificação"
                value={formData.documentId}
                onChangeText={(text) => setFormData({ ...formData, documentId: text })}
                mode="outlined"
                style={styles.input}
                right={<TextInput.Icon icon="camera" onPress={() => console.log('Open Camera')} />}
            />
            <View style={styles.navigationButtons}>
                <Button mode="outlined" onPress={handleBack} style={styles.navButton}>Voltar</Button>
                <Button mode="contained" onPress={handleNext} style={styles.navButton}>Próximo</Button>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.stepTitle}>Histórico Clínico</Text>
            <TextInput
                label="Alergias (separadas por vírgula)"
                value={formData.allergies}
                onChangeText={(text) => setFormData({ ...formData, allergies: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
            />
            <TextInput
                label="Doenças Pré-existentes"
                value={formData.preExistingConditions}
                onChangeText={(text) => setFormData({ ...formData, preExistingConditions: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
            />
            <Text variant="titleMedium" style={styles.subsectionTitle}>Seguro de Saúde</Text>
            <TextInput
                label="Seguradora"
                value={formData.insuranceProvider}
                onChangeText={(text) => setFormData({ ...formData, insuranceProvider: text })}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Número da Apólice"
                value={formData.insuranceNumber}
                onChangeText={(text) => setFormData({ ...formData, insuranceNumber: text })}
                mode="outlined"
                style={styles.input}
            />
            <View style={styles.navigationButtons}>
                <Button mode="outlined" onPress={handleBack} style={styles.navButton}>Voltar</Button>
                <Button
                    mode="contained"
                    onPress={handleRegister}
                    loading={loading}
                    style={styles.navButton}
                >
                    Finalizar Cadastro
                </Button>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://img.icons8.com/bubbles/200/medical-history.png' }}
                    style={styles.logo}
                />
                <Text variant="headlineMedium" style={styles.title}>Antigravity Patient</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>Cadastro Inteligente</Text>
            </View>

            <View style={styles.progressContainer}>
                <ProgressBar progress={step / 3} color="#0ea5e9" style={styles.progressBar} />
                <Text style={styles.progressText}>Passo {step} de 3</Text>
            </View>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <Portal>
                <Modal visible={showOtpModal} onDismiss={() => setShowOtpModal(false)} contentContainerStyle={styles.modalContent}>
                    <Card style={styles.modalCard}>
                        <Card.Content>
                            <Text variant="headlineSmall">Verificar Código</Text>
                            <Text variant="bodyMedium" style={styles.modalText}>
                                Digite o código de 6 dígitos enviado para {formData.phone}
                            </Text>
                            <TextInput
                                label="Código OTP"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                                mode="outlined"
                                style={styles.modalInput}
                            />
                            <Button mode="contained" onPress={handleVerifyOtp} style={styles.modalButton}>
                                Verificar
                            </Button>
                        </Card.Content>
                    </Card>
                </Modal>
            </Portal>

            <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.loginLink}
            >
                Já tem uma conta? Iniciar Sessão
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginVertical: 30,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        color: '#0ea5e9',
    },
    subtitle: {
        color: '#666',
    },
    progressContainer: {
        marginBottom: 30,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    progressText: {
        textAlign: 'center',
        marginTop: 8,
        color: '#666',
        fontSize: 12,
    },
    stepContainer: {
        gap: 15,
    },
    stepTitle: {
        marginBottom: 5,
        fontWeight: 'bold',
    },
    stepDescription: {
        marginBottom: 15,
        color: '#666',
    },
    input: {
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 10,
        paddingVertical: 5,
    },
    navigationButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    navButton: {
        flex: 1,
    },
    subsectionTitle: {
        marginTop: 10,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    modalText: {
        marginVertical: 15,
        color: '#666',
    },
    modalInput: {
        marginBottom: 20,
    },
    modalButton: {
        marginTop: 10,
    },
    loginLink: {
        marginTop: 20,
    },
});
