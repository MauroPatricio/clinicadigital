import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Divider, Chip } from 'react-native-paper';
import { format } from 'date-fns';
import { medicalRecordService } from '../services/appointmentService';

export default function MedicalRecordsScreen() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            const data = await medicalRecordService.getRecords();
            setRecords(data.data);
        } catch (error) {
            console.error('Failed to load records:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderRecord = (record: any) => {
        const isExpanded = expandedId === record._id;

        return (
            <Card key={record._id} style={styles.card}>
                <List.Accordion
                    title={record.chiefComplaint}
                    description={`Dr. ${record.doctor?.user?.profile?.lastName} - ${format(new Date(record.createdAt), 'PPP')}`}
                    expanded={isExpanded}
                    onPress={() => setExpandedId(isExpanded ? null : record._id)}
                    left={props => <List.Icon {...props} icon="file-document" />}
                >
                    <Card.Content>
                        <View style={styles.section}>
                            <Text variant="labelLarge" style={styles.sectionTitle}>Diagnosis</Text>
                            <Text variant="bodyMedium">{record.diagnosis}</Text>
                        </View>

                        {record.vitalSigns && (
                            <View style={styles.section}>
                                <Text variant="labelLarge" style={styles.sectionTitle}>Vital Signs</Text>
                                <View style={styles.vitalsGrid}>
                                    <View style={styles.vitalItem}>
                                        <Text variant="bodySmall" style={styles.vitalLabel}>Blood Pressure</Text>
                                        <Text variant="bodyMedium">{record.vitalSigns.bloodPressure?.systolic}/{record.vitalSigns.bloodPressure?.diastolic} mmHg</Text>
                                    </View>
                                    <View style={styles.vitalItem}>
                                        <Text variant="bodySmall" style={styles.vitalLabel}>Heart Rate</Text>
                                        <Text variant="bodyMedium">{record.vitalSigns.heartRate} bpm</Text>
                                    </View>
                                    <View style={styles.vitalItem}>
                                        <Text variant="bodySmall" style={styles.vitalLabel}>Temperature</Text>
                                        <Text variant="bodyMedium">{record.vitalSigns.temperature}°C</Text>
                                    </View>
                                    <View style={styles.vitalItem}>
                                        <Text variant="bodySmall" style={styles.vitalLabel}>Weight</Text>
                                        <Text variant="bodyMedium">{record.vitalSigns.weight} kg</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {record.treatment && (
                            <View style={styles.section}>
                                <Text variant="labelLarge" style={styles.sectionTitle}>Treatment</Text>
                                <Text variant="bodyMedium">{record.treatment}</Text>
                            </View>
                        )}

                        {record.prescriptions && record.prescriptions.length > 0 && (
                            <View style={styles.section}>
                                <Text variant="labelLarge" style={styles.sectionTitle}>Prescriptions</Text>
                                {record.prescriptions.map((rx: any, index: number) => (
                                    <Chip key={index} style={styles.prescriptionChip} icon="pill">
                                        {rx.prescriptionNumber}
                                    </Chip>
                                ))}
                            </View>
                        )}

                        {record.followUp && (
                            <View style={styles.section}>
                                <Text variant="labelLarge" style={styles.sectionTitle}>Follow Up</Text>
                                <Text variant="bodyMedium">
                                    {format(new Date(record.followUp.date), 'PPP')}
                                </Text>
                                <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
                                    {record.followUp.instructions}
                                </Text>
                            </View>
                        )}
                    </Card.Content>
                </List.Accordion>
            </Card>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium">Medical Records</Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Your complete medical history
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading records...</Text>
                </View>
            ) : records.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text variant="bodyLarge" style={styles.emptyText}>
                        No medical records yet
                    </Text>
                </View>
            ) : (
                <View style={styles.recordsList}>
                    {records.map(renderRecord)}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        color: '#666',
        marginTop: 4,
    },
    recordsList: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        marginBottom: 10,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        color: '#0ea5e9',
        marginBottom: 8,
    },
    vitalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    vitalItem: {
        flex: 1,
        minWidth: '45%',
    },
    vitalLabel: {
        color: '#666',
        marginBottom: 4,
    },
    prescriptionChip: {
        marginRight: 10,
        marginBottom: 5,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#999',
    },
});
