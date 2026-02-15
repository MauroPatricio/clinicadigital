import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Portal, Modal, TextInput, IconButton, ProgressBar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function VitalsMonitorScreen() {
    const [vitals, setVitals] = useState({
        weight: '72.5',
        height: '175',
        glucose: '95',
        systolic: '120',
        diastolic: '80',
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [activeVital, setActiveVital] = useState<any>(null);

    const historyData = [
        { date: '10 Fev', glucose: 98, bp: '120/80' },
        { date: '11 Fev', glucose: 105, bp: '125/85' },
        { date: '12 Fev', glucose: 95, bp: '118/78' },
        { date: 'Hoje', glucose: 92, bp: '120/80' },
    ];

    const renderVitalCard = (icon: string, label: string, value: string, unit: string, color: string, trend: 'up' | 'down' | 'stable') => (
        <Card style={styles.vitalCard}>
            <Card.Content>
                <View style={styles.vitalHeader}>
                    <View style={[styles.iconBg, { backgroundColor: color + '15' }]}>
                        <MaterialCommunityIcons name={icon} size={24} color={color} />
                    </View>
                    <IconButton icon="plus" size={20} onPress={() => { setActiveVital({ label, icon, color }); setModalVisible(true); }} />
                </View>
                <Text variant="labelMedium" style={styles.grayText}>{label}</Text>
                <View style={styles.valueRow}>
                    <Text variant="headlineMedium" style={styles.value}>{value}</Text>
                    <Text variant="bodySmall" style={styles.unit}>{unit}</Text>
                </View>
                <View style={styles.trendRow}>
                    <MaterialCommunityIcons
                        name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-neutral'}
                        size={16}
                        color={trend === 'stable' ? '#22c55e' : '#64748b'}
                    />
                    <Text style={[styles.trendText, { color: trend === 'stable' ? '#22c55e' : '#64748b' }]}>
                        {trend === 'stable' ? 'Normal' : 'Estável'}
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryHeader}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Seus Indicadores</Text>
                    <Text variant="bodySmall" style={styles.grayText}>Última atualização: Hoje, 10:30</Text>
                </View>

                <View style={styles.vitalGrid}>
                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>{renderVitalCard('water-plus', 'Glicémia', vitals.glucose, 'mg/dL', '#ef4444', 'stable')}</View>
                        <View style={styles.gridItem}>{renderVitalCard('heart-pulse', 'Tensão Art.', `${vitals.systolic}/${vitals.diastolic}`, 'mmHg', '#ec4899', 'stable')}</View>
                    </View>
                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>{renderVitalCard('weight-kilogram', 'Peso', vitals.weight, 'kg', '#8b5cf6', 'down')}</View>
                        <View style={styles.gridItem}>{renderVitalCard('human-male-height', 'Altura', vitals.height, 'cm', '#0ea5e9', 'stable')}</View>
                    </View>
                </View>

                {/* Simulated Chart Section */}
                <View style={styles.chartSection}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Evolução de Glicémia</Text>
                    <View style={styles.simulatedChart}>
                        <View style={styles.chartBars}>
                            {historyData.map((d, i) => (
                                <View key={i} style={styles.barContainer}>
                                    <View style={[styles.bar, { height: (d.glucose / 150) * 100 }]} />
                                    <Text style={styles.barLabel}>{d.date}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.yAxis}>
                            <Text style={styles.axisText}>150</Text>
                            <Text style={styles.axisText}>100</Text>
                            <Text style={styles.axisText}>50</Text>
                        </View>
                    </View>
                </View>

                {/* Health Reminder */}
                <Card style={styles.reminderCard}>
                    <Card.Content style={styles.reminderContent}>
                        <MaterialCommunityIcons name="pill" size={32} color="#0ea5e9" />
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text variant="titleMedium">Próxima Medicação</Text>
                            <Text variant="bodySmall">Paracetamol 500mg em 30 minutos.</Text>
                        </View>
                        <Button mode="text" labelStyle={{ fontSize: 10 }}>Histórico</Button>
                    </Card.Content>
                </Card>

                <View style={{ height: 40 }} />
            </ScrollView>

            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
                    <Card style={styles.modalCard}>
                        <Card.Content>
                            <View style={styles.modalHeader}>
                                <Avatar.Icon size={40} icon={activeVital?.icon || 'plus'} style={{ backgroundColor: activeVital?.color }} />
                                <Text variant="headlineSmall" style={styles.modalTitle}>Adicionar {activeVital?.label}</Text>
                            </View>
                            <TextInput
                                label="Valor"
                                keyboardType="numeric"
                                mode="outlined"
                                style={styles.modalInput}
                                right={<TextInput.Icon icon="pencil" />}
                            />
                            <View style={styles.modalButtons}>
                                <Button mode="text" onPress={() => setModalVisible(false)}>Cancelar</Button>
                                <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.saveBtn}>Salvar</Button>
                            </View>
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
    content: {
        padding: 20,
    },
    summaryHeader: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    grayText: {
        color: '#64748b',
    },
    vitalGrid: {
        gap: 15,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 15,
    },
    gridItem: {
        flex: 1,
    },
    vitalCard: {
        borderRadius: 20,
        backgroundColor: '#fff',
        elevation: 1,
    },
    vitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginVertical: 4,
    },
    value: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    unit: {
        color: '#64748b',
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 10,
    },
    chartSection: {
        marginTop: 30,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        elevation: 1,
    },
    simulatedChart: {
        marginTop: 20,
        height: 150,
        flexDirection: 'row',
        paddingLeft: 30,
    },
    chartBars: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    barContainer: {
        alignItems: 'center',
    },
    bar: {
        width: 15,
        backgroundColor: '#0ea5e9',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    barLabel: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 5,
    },
    yAxis: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    axisText: {
        fontSize: 10,
        color: '#94a3b8',
    },
    reminderCard: {
        marginTop: 20,
        backgroundColor: '#f0f9ff',
        borderRadius: 15,
    },
    reminderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalContent: {
        padding: 20,
    },
    modalCard: {
        borderRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 20,
    },
    modalTitle: {
        fontWeight: 'bold',
    },
    modalInput: {
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    saveBtn: {
        paddingHorizontal: 20,
    },
});
