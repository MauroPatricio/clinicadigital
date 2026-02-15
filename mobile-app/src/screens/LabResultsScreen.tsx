import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, List, Button, IconButton, Chip, Searchbar, SegmentedButtons } from 'react-native-paper';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import labService from '../services/labService';

export default function LabResultsScreen() {
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        setLoading(true);
        try {
            const data = await labService.getLabExams();
            setExams(data.data || []);
        } catch (error) {
            console.error('Error loading exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || exam.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#22c55e';
            case 'pending': return '#f97316';
            case 'critical': return '#ef4444';
            default: return '#64748b';
        }
    };

    const renderExamCard = (exam: any) => (
        <Card key={exam.id} style={styles.card}>
            <Card.Content>
                <View style={styles.cardHeader}>
                    <View style={styles.headerInfo}>
                        <Text variant="titleMedium" style={styles.examName}>{exam.name}</Text>
                        <Text variant="bodySmall" style={styles.clinicName}>{exam.clinic}</Text>
                    </View>
                    <Chip
                        textStyle={{ color: '#fff', fontSize: 10 }}
                        style={{ backgroundColor: getStatusColor(exam.status), height: 24, justifyContent: 'center' }}
                    >
                        {exam.status.toUpperCase()}
                    </Chip>
                </View>

                <View style={styles.examDetails}>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#64748b" />
                        <Text variant="bodySmall" style={styles.detailText}>
                            {format(new Date(exam.date), "dd MMM yyyy", { locale: pt })}
                        </Text>
                    </View>
                    {exam.result && (
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="flask-outline" size={16} color="#64748b" />
                            <Text variant="bodySmall" style={styles.detailText}>
                                Resultado: <Text style={styles.resultValue}>{exam.result}</Text>
                            </Text>
                        </View>
                    )}
                </View>

                {exam.status === 'completed' && (
                    <View style={styles.cardActions}>
                        <Button
                            mode="outlined"
                            icon="download"
                            style={styles.actionButton}
                            onPress={() => console.log('Download PDF')}
                        >
                            PDF
                        </Button>
                        <Button
                            mode="contained"
                            icon="chart-line"
                            style={styles.actionButton}
                            onPress={() => console.log('View Trends')}
                        >
                            Evolução
                        </Button>
                    </View>
                )}
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Pesquisar exames..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />
                <SegmentedButtons
                    value={filter}
                    onValueChange={setFilter}
                    buttons={[
                        { value: 'all', label: 'Todos' },
                        { value: 'pending', label: 'Pendentes' },
                        { value: 'completed', label: 'Prontos' },
                    ]}
                    style={styles.segments}
                />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadExams} />}
            >
                {filteredExams.length > 0 ? (
                    filteredExams.map(renderExamCard)
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="flask-empty-outline" size={64} color="#e2e8f0" />
                        <Text variant="bodyLarge" style={styles.emptyText}>Nenhum exame encontrado</Text>
                    </View>
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
        padding: 20,
        backgroundColor: '#fff',
        gap: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    searchBar: {
        backgroundColor: '#f1f5f9',
        elevation: 0,
    },
    segments: {
        height: 40,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        marginBottom: 15,
        borderRadius: 15,
        backgroundColor: '#fff',
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerInfo: {
        flex: 1,
        marginRight: 10,
    },
    examName: {
        fontWeight: 'bold',
        color: '#1e293b',
    },
    clinicName: {
        color: '#64748b',
    },
    examDetails: {
        gap: 8,
        marginBottom: 15,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        color: '#64748b',
    },
    resultValue: {
        fontWeight: 'bold',
        color: '#0ea5e9',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 15,
    },
    actionButton: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        marginTop: 15,
        color: '#94a3b8',
    },
});
