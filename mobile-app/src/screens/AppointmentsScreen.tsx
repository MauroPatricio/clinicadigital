import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Button, List, Chip, Searchbar } from 'react-native-paper';
import { format } from 'date-fns';
import { appointmentService } from '../services/appointmentService';

export default function AppointmentsScreen({ navigation }: any) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadAppointments();
    }, [filter]);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getAppointments({
                status: filter === 'upcoming' ? 'scheduled,confirmed' : 'completed,cancelled'
            });
            setAppointments(data.data);
        } catch (error) {
            console.error('Failed to load appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            scheduled: '#2196F3',
            confirmed: '#4CAF50',
            completed: '#9E9E9E',
            cancelled: '#F44336',
        };
        return colors[status] || '#2196F3';
    };

    const renderAppointment = ({ item }: any) => (
        <Card
            style={styles.card}
            onPress={() => navigation.navigate('AppointmentDetails', { appointment: item })}
        >
            <Card.Content>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium">
                            Dr. {item.doctor?.user?.profile?.lastName}
                        </Text>
                        <Text variant="bodySmall" style={styles.specialty}>
                            {item.specialty}
                        </Text>
                    </View>
                    <Chip
                        mode="flat"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                        textStyle={{ color: '#fff' }}
                    >
                        {item.status}
                    </Chip>
                </View>

                <View style={styles.dateContainer}>
                    <Text variant="bodyMedium">
                        📅 {format(new Date(item.dateTime), 'PPP')}
                    </Text>
                    <Text variant="bodyMedium">
                        🕐 {format(new Date(item.dateTime), 'p')}
                    </Text>
                </View>

                <View style={styles.typeContainer}>
                    <Chip icon={item.type === 'online' ? 'video' : 'hospital-building'} mode="outlined">
                        {item.type === 'online' ? 'Online' : 'In-Person'}
                    </Chip>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium">Appointments</Text>
                <Button
                    mode="contained"
                    icon="calendar-plus"
                    onPress={() => navigation.navigate('BookAppointment')}
                    style={styles.bookButton}
                >
                    Book New
                </Button>
            </View>

            <View style={styles.filterContainer}>
                <Chip
                    selected={filter === 'upcoming'}
                    onPress={() => setFilter('upcoming')}
                    style={styles.filterChip}
                >
                    Upcoming
                </Chip>
                <Chip
                    selected={filter === 'past'}
                    onPress={() => setFilter('past')}
                    style={styles.filterChip}
                >
                    Past
                </Chip>
            </View>

            <FlatList
                data={appointments}
                renderItem={renderAppointment}
                keyExtractor={(item) => item._id}
                refreshing={loading}
                onRefresh={loadAppointments}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text variant="bodyLarge" style={styles.emptyText}>
                            No {filter} appointments
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    bookButton: {
        borderRadius: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 10,
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    specialty: {
        color: '#666',
        marginTop: 4,
    },
    dateContainer: {
        marginTop: 10,
        gap: 5,
    },
    typeContainer: {
        marginTop: 10,
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
