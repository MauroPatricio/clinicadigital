import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Button, List, IconButton, Modal, Portal, TextInput, Chip } from 'react-native-paper';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import paymentService from '../services/paymentService';

export default function PaymentScreen() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingInvoice, setPayingInvoice] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola'>('mpesa');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const data = await paymentService.getInvoices();
            setInvoices(data.data || []);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!phoneNumber) return;
        setPaymentLoading(true);
        try {
            const service = paymentMethod === 'mpesa'
                ? paymentService.processMpesaPayment
                : paymentService.processEmolaPayment;

            await service(payingInvoice.id, phoneNumber);
            setPayingInvoice(null);
            setSuccessModal(true);
            loadInvoices(); // Reload to show updated status
        } catch (error) {
            console.error('Payment failed:', error);
        } finally {
            setPaymentLoading(false);
        }
    };

    const renderInvoice = (invoice: any) => (
        <Card key={invoice.id} style={styles.invoiceCard}>
            <Card.Content>
                <View style={styles.invoiceHeader}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                            name={invoice.status === 'paid' ? 'check-decagram' : 'clock-outline'}
                            size={24}
                            color={invoice.status === 'paid' ? '#22c55e' : '#f97316'}
                        />
                    </View>
                    <View style={styles.invoiceInfo}>
                        <Text variant="titleMedium" style={styles.invoiceTitle}>{invoice.description}</Text>
                        <Text variant="bodySmall" style={styles.invoiceDate}>
                            {format(new Date(invoice.date), "dd/MM/yyyy")} • {invoice.clinic}
                        </Text>
                    </View>
                    <Text variant="titleLarge" style={styles.invoiceAmount}>
                        {invoice.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'MZN' })}
                    </Text>
                </View>

                {invoice.status === 'pending' && (
                    <Button
                        mode="contained"
                        onPress={() => setPayingInvoice(invoice)}
                        style={styles.payButton}
                        icon="credit-card-outline"
                    >
                        Pagar Agora
                    </Button>
                )}
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.summaryBar}>
                <View style={styles.summaryItem}>
                    <Text variant="labelSmall" style={styles.summaryLabel}>Total Pendente</Text>
                    <Text variant="headlineSmall" style={styles.summaryValue}>
                        {(invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0))
                            .toLocaleString('pt-PT', { style: 'currency', currency: 'MZN' })}
                    </Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.summaryItem}>
                    <Text variant="labelSmall" style={styles.summaryLabel}>Carteira Digital</Text>
                    <Text variant="headlineSmall" style={[styles.summaryValue, { color: '#22c55e' }]}>
                        5.450,00 MT
                    </Text>
                </View>
            </View>
            <Button
                mode="text"
                icon="plus"
                onPress={() => console.log('Top up')}
                style={styles.topUpBtn}
            >
                Recarregar Carteira
            </Button>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadInvoices} />}
            >
                <Text variant="titleMedium" style={styles.sectionTitle}>Histórico de Faturas</Text>
                {invoices.length > 0 ? (
                    invoices.map(renderInvoice)
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="receipt" size={64} color="#e2e8f0" />
                        <Text variant="bodyLarge">Sem faturas registradas</Text>
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Payment Modal */}
            <Portal>
                <Modal
                    visible={!!payingInvoice}
                    onDismiss={() => setPayingInvoice(null)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Card style={styles.modalCard}>
                        <Card.Content>
                            <Text variant="headlineSmall" style={styles.modalTitle}>Checkout</Text>
                            <Text variant="bodyMedium" style={styles.modalDesc}>
                                Selecione o método de pagamento para {payingInvoice?.description}
                            </Text>

                            <View style={styles.methodSelector}>
                                <TouchableOpacity
                                    style={[styles.methodItem, paymentMethod === 'mpesa' && styles.selectedMethod]}
                                    onPress={() => setPaymentMethod('mpesa')}
                                >
                                    <View style={[styles.methodIcon, { backgroundColor: '#af1c24' }]}>
                                        <Text style={styles.methodText}>M</Text>
                                    </View>
                                    <Text variant="labelLarge">M-Pesa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.methodItem, paymentMethod === 'emola' && styles.selectedMethod]}
                                    onPress={() => setPaymentMethod('emola')}
                                >
                                    <View style={[styles.methodIcon, { backgroundColor: '#f97316' }]}>
                                        <Text style={styles.methodText}>e</Text>
                                    </View>
                                    <Text variant="labelLarge">e-Mola</Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                label="Número de Telefone (84/85/82/87)"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                mode="outlined"
                                style={styles.modalInput}
                                maxLength={9}
                            />

                            <View style={styles.modalFooter}>
                                <Button mode="text" onPress={() => setPayingInvoice(null)}>Cancelar</Button>
                                <Button
                                    mode="contained"
                                    onPress={handlePayment}
                                    loading={paymentLoading}
                                    style={styles.modalPayButton}
                                >
                                    Confirmar Pagamento
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </Modal>

                <Modal
                    visible={successModal}
                    onDismiss={() => setSuccessModal(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Card style={styles.successCard}>
                        <Card.Content style={styles.successContent}>
                            <MaterialCommunityIcons name="check-circle" size={80} color="#22c55e" />
                            <Text variant="headlineSmall" style={styles.successTitle}>Solicitação Enviada!</Text>
                            <Text variant="bodyMedium" style={styles.successText}>
                                Verifique o seu telefone para confirmar a transação digitando o seu PIN.
                            </Text>
                            <Button mode="contained" onPress={() => setSuccessModal(false)}>Ok, entendi</Button>
                        </Card.Content>
                    </Card>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    summaryBar: {
        padding: 24,
        paddingBottom: 15,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    verticalDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#e2e8f0',
    },
    topUpBtn: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        borderRadius: 0,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        color: '#64748b',
        textTransform: 'uppercase',
    },
    summaryValue: {
        fontWeight: 'bold',
        color: '#0f172a',
        marginTop: 4,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        marginBottom: 15,
        fontWeight: 'bold',
        color: '#334155',
    },
    invoiceCard: {
        marginBottom: 15,
        borderRadius: 15,
        elevation: 2,
    },
    invoiceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    invoiceInfo: {
        flex: 1,
        marginLeft: 12,
    },
    invoiceTitle: {
        fontWeight: 'bold',
    },
    invoiceDate: {
        color: '#64748b',
    },
    invoiceAmount: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    payButton: {
        borderRadius: 10,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 100,
    },
    modalContent: {
        padding: 20,
    },
    modalCard: {
        borderRadius: 20,
    },
    modalTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDesc: {
        color: '#64748b',
        marginBottom: 20,
    },
    methodSelector: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    methodItem: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        gap: 8,
    },
    selectedMethod: {
        borderColor: '#0ea5e9',
        backgroundColor: '#f0f9ff',
    },
    methodIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    methodText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
    modalInput: {
        marginBottom: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    modalPayButton: {
        flex: 1,
    },
    successCard: {
        borderRadius: 20,
    },
    successContent: {
        alignItems: 'center',
        padding: 20,
        gap: 15,
    },
    successTitle: {
        fontWeight: 'bold',
    },
    successText: {
        textAlign: 'center',
        color: '#64748b',
        lineHeight: 20,
    },
});
