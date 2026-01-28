import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, RadioButton, TextInput, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import toast from 'react-hot-toast';

interface PaymentScreenProps {
    route: any;
    navigation: any;
}

export default function PaymentScreen({ route, navigation }: PaymentScreenProps) {
    const { invoice } = route.params;
    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);

        try {
            if (paymentMethod === 'mpesa') {
                // Simulate M-Pesa payment
                await new Promise(resolve => setTimeout(resolve, 2000));
                toast.success('Payment request sent to ' + phoneNumber);
            } else {
                // Simulate card payment
                await new Promise(resolve => setTimeout(resolve, 2000));
                toast.success('Payment processed successfully');
            }

            navigation.goBack();
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.invoiceCard}>
                <Card.Content>
                    <Text variant="titleMedium" style={{ marginBottom: 10 }}>
                        Invoice Summary
                    </Text>
                    <View style={styles.summaryRow}>
                        <Text variant="bodyMedium">Invoice Number:</Text>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                            {invoice?.billNumber}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text variant="bodyMedium">Amount Due:</Text>
                        <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#0ea5e9' }}>
                            {invoice?.total?.toLocaleString()} MT
                        </Text>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={{ marginBottom: 15 }}>
                        Select Payment Method
                    </Text>

                    <RadioButton.Group
                        onValueChange={setPaymentMethod}
                        value={paymentMethod}
                    >
                        {/* M-Pesa */}
                        <View style={styles.paymentOption}>
                            <RadioButton value="mpesa" />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <View style={styles.paymentHeader}>
                                    <MaterialCommunityIcons name="cellphone" size={24} color="#10b981" />
                                    <Text variant="titleMedium" style={{ marginLeft: 10 }}>
                                        M-Pesa
                                    </Text>
                                </View>
                                <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
                                    Pay with your M-Pesa mobile money
                                </Text>
                            </View>
                        </View>

                        <Divider style={{ marginVertical: 15 }} />

                        {/* Card Payment */}
                        <View style={styles.paymentOption}>
                            <RadioButton value="card" />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <View style={styles.paymentHeader}>
                                    <MaterialCommunityIcons name="credit-card" size={24} color="#3b82f6" />
                                    <Text variant="titleMedium" style={{ marginLeft: 10 }}>
                                        Credit/Debit Card
                                    </Text>
                                </View>
                                <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
                                    Pay with Visa or Mastercard
                                </Text>
                            </View>
                        </View>
                    </RadioButton.Group>
                </Card.Content>
            </Card>

            {/* Payment Details */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={{ marginBottom: 15 }}>
                        Payment Details
                    </Text>

                    {paymentMethod === 'mpesa' ? (
                        <TextInput
                            label="M-Pesa Phone Number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            mode="outlined"
                            placeholder="+258 84 123 4567"
                            keyboardType="phone-pad"
                            left={<TextInput.Icon icon="cellphone" />}
                        />
                    ) : (
                        <>
                            <TextInput
                                label="Card Number"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                mode="outlined"
                                placeholder="1234 5678 9012 3456"
                                keyboardType="numeric"
                                maxLength={19}
                                left={<TextInput.Icon icon="credit-card" />}
                                style={{ marginBottom: 15 }}
                            />
                            <View style={styles.cardRow}>
                                <TextInput
                                    label="Expiry (MM/YY)"
                                    value={cardExpiry}
                                    onChangeText={setCardExpiry}
                                    mode="outlined"
                                    placeholder="12/25"
                                    maxLength={5}
                                    style={{ flex: 1, marginRight: 10 }}
                                />
                                <TextInput
                                    label="CVV"
                                    value={cardCVV}
                                    onChangeText={setCardCVV}
                                    mode="outlined"
                                    placeholder="123"
                                    keyboardType="numeric"
                                    maxLength={3}
                                    secureTextEntry
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </>
                    )}
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={handlePayment}
                loading={processing}
                disabled={processing || (paymentMethod === 'mpesa' ? !phoneNumber : !cardNumber)}
                style={styles.payButton}
                contentStyle={{ paddingVertical: 8 }}
            >
                Pay {invoice?.total?.toLocaleString()} MT
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    invoiceCard: {
        margin: 20,
        marginBottom: 10,
    },
    card: {
        margin: 20,
        marginTop: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardRow: {
        flexDirection: 'row',
    },
    payButton: {
        margin: 20,
        marginTop: 10,
    },
});
