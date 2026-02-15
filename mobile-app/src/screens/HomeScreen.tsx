import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Button, Avatar, Badge, DataTable, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import labService from '../services/labService';
import paymentService from '../services/paymentService';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function HomeScreen({ navigation }: any) {
    const { user } = useSelector((state: RootState) => state.auth);
    const [exams, setExams] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [examsData, invoicesData] = await Promise.all([
                labService.getLabExams(),
                paymentService.getInvoices({ status: 'pending' })
            ]);
            setExams(examsData.data || []);
            setInvoices(invoicesData.data || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const upcomingAppointment = {
        doctor: 'Dr. Julião Mabote',
        specialty: 'Medicina Geral',
        date: new Date(Date.now() + 172800000).toISOString(),
        clinic: 'Clínica Antigravity Central',
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header / Profile */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text variant="bodyLarge" style={styles.greeting}>Olá,</Text>
                        <Text variant="headlineSmall" style={styles.userName}>
                            {user?.profile?.firstName || 'Paciente'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Avatar.Image
                            size={50}
                            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Clinic Connection */}
                <Card style={styles.clinicCard}>
                    <Card.Content style={styles.clinicContent}>
                        <View style={styles.clinicInfo}>
                            <MaterialCommunityIcons name="hospital-building" size={24} color="#0ea5e9" />
                            <View>
                                <Text variant="labelLarge">Unidade Associada</Text>
                                <Text variant="bodyLarge" style={styles.clinicName}>Clínica Antigravity Central</Text>
                            </View>
                        </View>
                        <IconButton icon="chevron-right" onPress={() => console.log('Clinic Details')} />
                    </Card.Content>
                </Card>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.section}>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.actionItem, { backgroundColor: '#e0f2fe' }]}
                        onPress={() => navigation.navigate('BookAppointment')}
                    >
                        <MaterialCommunityIcons name="calendar-plus" size={32} color="#0ea5e9" />
                        <Text variant="labelMedium" style={styles.actionLabel}>Marcar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionItem, { backgroundColor: '#f0fdf4' }]}
                        onPress={() => navigation.navigate('Vitals')}
                    >
                        <MaterialCommunityIcons name="heart-pulse" size={32} color="#22c55e" />
                        <Text variant="labelMedium" style={styles.actionLabel}>Sinais</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionItem, { backgroundColor: '#fef2f2' }]}
                        onPress={() => navigation.navigate('Exams')}
                    >
                        <MaterialCommunityIcons name="test-tube" size={32} color="#ef4444" />
                        <Text variant="labelMedium" style={styles.actionLabel}>Exames</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionItem, { backgroundColor: '#fff7ed' }]}
                        onPress={() => navigation.navigate('Payments')}
                    >
                        <MaterialCommunityIcons name="credit-card" size={32} color="#f97316" />
                        <Text variant="labelMedium" style={styles.actionLabel}>Pagos</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Next Appointment Prominent View */}
            <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>Próxima Consulta</Text>
                <Card style={styles.appointmentCard}>
                    <Card.Content>
                        <View style={styles.appointmentHeader}>
                            <MaterialCommunityIcons name="calendar-check" size={24} color="#fff" />
                            <Text variant="titleMedium" style={styles.whiteText}>Em 2 dias</Text>
                        </View>
                        <Text variant="headlineSmall" style={styles.whiteText}>{upcomingAppointment.doctor}</Text>
                        <Text variant="bodyLarge" style={styles.whiteText}>{upcomingAppointment.specialty}</Text>
                        <View style={styles.divider} />
                        <View style={styles.appointmentFooter}>
                            <View style={styles.footerItem}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color="#fff" />
                                <Text variant="bodySmall" style={styles.whiteText}>
                                    {format(new Date(upcomingAppointment.date), "HH:mm")}
                                </Text>
                            </View>
                            <View style={styles.footerItem}>
                                <MaterialCommunityIcons name="map-marker-outline" size={16} color="#fff" />
                                <Text variant="bodySmall" style={styles.whiteText}>{upcomingAppointment.clinic}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </View>

            {/* Pending Items Horizontal */}
            <View style={styles.section}>
                <Text variant="titleLarge" style={styles.sectionTitle}>Ações Pendentes</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {exams.filter(e => e.status === 'pending').map(exam => (
                        <Card key={exam.id} style={styles.pendingCard}>
                            <Card.Content>
                                <View style={styles.pendingIconBg}>
                                    <MaterialCommunityIcons name="test-tube" size={24} color="#ef4444" />
                                </View>
                                <Text variant="titleMedium">Resultado Pendente</Text>
                                <Text variant="bodySmall" style={styles.grayText}>{exam.name}</Text>
                                <Button mode="text" labelStyle={{ fontSize: 12 }}>Verificar</Button>
                            </Card.Content>
                        </Card>
                    ))}
                    {invoices.filter(i => i.status === 'pending').map(invoice => (
                        <Card key={invoice.id} style={[styles.pendingCard, { borderColor: '#f97316' }]}>
                            <Card.Content>
                                <View style={[styles.pendingIconBg, { backgroundColor: '#fff7ed' }]}>
                                    <MaterialCommunityIcons name="cash-multiple" size={24} color="#f97316" />
                                </View>
                                <Text variant="titleMedium">Pagamento Aberto</Text>
                                <Text variant="bodySmall" style={styles.grayText}>{invoice.description}</Text>
                                <Text variant="labelLarge" style={styles.orangeText}>
                                    {invoice.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'MZN' })}
                                </Text>
                            </Card.Content>
                        </Card>
                    ))}
                </ScrollView>
            </View>

            {/* AI Assistant Insight with Navigation */}
            <View style={styles.section}>
                <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
                    <Card style={styles.insightCard}>
                        <Card.Content style={styles.insightContent}>
                            <Avatar.Icon size={40} icon="robot" style={{ backgroundColor: '#0ea5e9' }} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text variant="titleMedium">Fale com o Assistente</Text>
                                <Text variant="bodySmall">Dúvidas sobre medicação ou diagnósticos? Estive a analisar o seu perfil clínico...</Text>
                            </View>
                            <IconButton icon="chevron-right" />
                        </Card.Content>
                    </Card>
                </TouchableOpacity>
            </View>

            {/* Chat with Clinic Floating-style button or section */}
            <Card style={[styles.section, { backgroundColor: 'transparent', elevation: 0 }]}>
                <Button
                    mode="contained"
                    icon="chat-processing-outline"
                    onPress={() => navigation.navigate('Chat')}
                    style={{ borderRadius: 15, paddingVertical: 5 }}
                >
                    Conversar com a Clínica
                </Button>
            </Card>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        backgroundColor: '#f8fafc',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        color: '#64748b',
    },
    userName: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    clinicCard: {
        borderRadius: 15,
        elevation: 2,
    },
    clinicContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    clinicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    clinicName: {
        fontWeight: 'bold',
        color: '#0ea5e9',
    },
    section: {
        padding: 20,
        paddingBottom: 0,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#0f172a',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionItem: {
        width: '23%',
        aspectRatio: 1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    actionLabel: {
        marginTop: 5,
        color: '#334155',
        textAlign: 'center',
    },
    appointmentCard: {
        backgroundColor: '#0ea5e9',
        borderRadius: 20,
        elevation: 4,
    },
    appointmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    whiteText: {
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 15,
    },
    appointmentFooter: {
        flexDirection: 'row',
        gap: 20,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    horizontalScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    pendingCard: {
        width: 200,
        marginRight: 15,
        borderRadius: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    pendingIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    grayText: {
        color: '#64748b',
        marginTop: 5,
    },
    orangeText: {
        color: '#f97316',
        fontWeight: 'bold',
        marginTop: 5,
    },
    insightCard: {
        borderRadius: 15,
        backgroundColor: '#f0f9ff',
    },
    insightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
