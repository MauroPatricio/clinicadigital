import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, List, Button, IconButton, Chip, Searchbar, SegmentedButtons } from 'react-native-paper';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { medicalRecordService } from '../services/appointmentService';

export default function MedicalRecordsScreen() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const data = await medicalRecordService.getRecords();
            setRecords(data.data || []);
        } catch (error) {
            console.error('Failed to load records:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderTimelineItem = (record: any, index: number) => {
        const isExpanded = expandedId === record._id;
        const date = new Date(record.createdAt);

        return (
            <View key={record._id} style={styles.timelineItem}>
                {/* Left Side: Date & Dot */}
                <View style={styles.timelineLeft}>
                    <Text variant="titleSmall" style={styles.timelineDate}>
                        {format(date, "dd MMM", { locale: pt })}
                    </Text>
                    <Text variant="bodySmall" style={styles.timelineYear}>
                        {format(date, "yyyy")}
                    </Text>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineDot} />
                </View>

                {/* Right Side: Content Card */}
                <View style={styles.timelineRight}>
                    <Card style={styles.card} onPress={() => setExpandedId(isExpanded ? null : record._id)}>
                        <Card.Content>
                            <View style={styles.recordHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text variant="titleMedium" style={styles.complaint}>
                                        {record.chiefComplaint || 'Consulta Geral'}
                                    </Text>
                                    <View style={styles.clinicInfo}>
                                        <MaterialCommunityIcons name="hospital-building" size={14} color="#64748b" />
                                        <Text variant="bodySmall" style={styles.grayText}>
                                            {record.clinic?.name || 'Clínica Antigravity Central'}
                                        </Text>
                                    </View>
                                </View>
                                <IconButton
                                    icon={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    onPress={() => setExpandedId(isExpanded ? null : record._id)}
                                />
                            </View>

                            <View style={styles.doctorInfo}>
                                <MaterialCommunityIcons name="account-tie" size={14} color="#0ea5e9" />
                                <Text variant="labelSmall" style={styles.doctorName}>
                                    Dr. {record.doctor?.user?.profile?.firstName} {record.doctor?.user?.profile?.lastName}
                                </Text>
                            </View>

                            {isExpanded && (
                                <View style={styles.expandedContent}>
                                    <View style={styles.divider} />

                                    <View style={styles.section}>
                                        <Text variant="labelMedium" style={styles.sectionTitle}>Diagnóstico</Text>
                                        <Text variant="bodyMedium">{record.diagnosis}</Text>
                                    </View>

                                    {record.treatment && (
                                        <View style={styles.section}>
                                            <Text variant="labelMedium" style={styles.sectionTitle}>Tratamento</Text>
                                            <Text variant="bodyMedium">{record.treatment}</Text>
                                        </View>
                                    )}

                                    {record.prescriptions && record.prescriptions.length > 0 && (
                                        <View style={styles.section}>
                                            <Text variant="labelMedium" style={styles.sectionTitle}>Prescrições</Text>
                                            <View style={styles.chipStack}>
                                                {record.prescriptions.map((rx: any, idx: number) => (
                                                    <Chip key={idx} icon="pill" style={styles.chip}>
                                                        {rx.prescriptionNumber || 'RX-' + idx}
                                                    </Chip>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.cardActions}>
                                        <Button icon="file-pdf-box" mode="outlined" style={styles.pdfButton}>
                                            Baixar Relatório
                                        </Button>
                                    </View>
                                </View>
                            )}
                        </Card.Content>
                    </Card>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.title}>Histórico Clínico</Text>
                <Text variant="bodyMedium" style={styles.subtitle}>Linha do tempo da sua saúde</Text>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRecords} />}
            >
                {records.length > 0 ? (
                    <View style={styles.timeline}>
                        {records.map((record, index) => renderTimelineItem(record, index))}
                    </View>
                ) : (
                    !loading && (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="timeline-alert-outline" size={64} color="#e2e8f0" />
                            <Text variant="bodyLarge">Nenhum registro clínico encontrado</Text>
                        </View>
                    )
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subtitle: {
        color: '#64748b',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    timeline: {
        paddingTop: 10,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timelineLeft: {
        width: 60,
        alignItems: 'center',
        paddingTop: 5,
    },
    timelineDate: {
        fontWeight: 'bold',
        color: '#0ea5e9',
    },
    timelineYear: {
        fontSize: 10,
        color: '#94a3b8',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0ea5e9',
        borderWidth: 2,
        borderColor: '#fff',
        position: 'absolute',
        right: -6,
        top: 25,
        zIndex: 1,
    },
    timelineLine: {
        position: 'absolute',
        right: -1,
        top: 35,
        bottom: -20,
        width: 2,
        backgroundColor: '#e2e8f0',
    },
    timelineRight: {
        flex: 1,
        marginLeft: 20,
    },
    card: {
        borderRadius: 15,
        backgroundColor: '#fff',
        elevation: 2,
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    complaint: {
        fontWeight: 'bold',
        color: '#1e293b',
    },
    clinicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 4,
    },
    grayText: {
        color: '#64748b',
        fontSize: 11,
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
    },
    doctorName: {
        color: '#0ea5e9',
    },
    expandedContent: {
        marginTop: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 15,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: 5,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    chipStack: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        height: 32,
    },
    pdfButton: {
        marginTop: 10,
    },
    cardActions: {
        marginTop: 10,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 100,
    },
});
