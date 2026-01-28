import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, FAB, Chip } from 'react-native-paper';
import { format } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen({ navigation }: any) {
    const upcomingAppointments = [
        {
            id: '1',
            doctor: 'Dr. Silva',
            specialty: 'Cardiology',
            date: new Date(2024, 11, 15, 10, 0),
            type: 'online',
            status: 'confirmed'
        },
    ];

    const renderAppointment = ({ item }: any) => (
        <Card style={styles.card} onPress={() => navigation.navigate('AppointmentDetails', { id: item.id })}>
            <Card.Content>
                <View style={styles.appointmentHeader}>
                    <View>
                        <Text variant="titleMedium">{item.doctor}</Text>
                        <Text variant="bodySmall" style={styles.specialty}>{item.specialty}</Text>
                    </View>
                    <Chip icon={item.type === 'online' ? 'video' : 'hospital-building'} mode="outlined">
                        {item.type}
                    </Chip>
                </View>

                <View style={styles.dateTime}>
                    <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                    <Text variant="bodyMedium" style={styles.dateText}>
                        {format(item.date, 'PPP')} at {format(item.date, 'p')}
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium">Welcome back!</Text>
                <Text variant="bodyLarge" style={styles.subtitle}>Your health dashboard</Text>
            </View>

            <View style={styles.quickActions}>
                <Button
                    mode="contained"
                    icon="calendar-plus"
                    onPress={() => navigation.navigate('BookAppointment')}
                    style={styles.actionButton}
                >
                    Book Appointment
                </Button>
                <Button
                    mode="outlined"
                    icon="file-document"
                    onPress={() => navigation.navigate('MedicalRecords')}
                    style={styles.actionButton}
                >
                    Medical Records
                </Button>
            </View>

            <Text variant="titleLarge" style={styles.sectionTitle}>Upcoming Appointments</Text>

            <FlatList
                data={upcomingAppointments}
                renderItem={renderAppointment}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar-blank" size={60} color="#ccc" />
                        <Text variant="bodyLarge" style={styles.emptyText}>No upcoming appointments</Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('BookAppointment')}
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
        padding: 20,
        backgroundColor: '#fff',
    },
    subtitle: {
        color: '#666',
        marginTop: 4,
    },
    quickActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 10,
    },
    actionButton: {
        flex: 1,
    },
    sectionTitle: {
        paddingHorizontal: 20,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    card: {
        marginHorizontal: 20,
        marginBottom: 10,
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    specialty: {
        color: '#666',
        marginTop: 4,
    },
    dateTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
