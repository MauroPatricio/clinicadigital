import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Searchbar, Chip, RadioButton, Button } from 'react-native-paper';
import { appointmentService } from '../services/appointmentService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function BookAppointmentScreen({ navigation }: any) {
    const [step, setStep] = useState(1);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [appointmentType, setAppointmentType] = useState('presencial');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');

    const specialties = [
        'All',
        'General Practice',
        'Cardiology',
        'Pediatrics',
        'Dermatology',
        'Orthopedics',
    ];

    useEffect(() => {
        if (step === 1) {
            loadDoctors();
        }
    }, [selectedSpecialty]);

    const loadDoctors = async () => {
        try {
            setLoading(true);
            const params = selectedSpecialty !== 'all' ? { specialization: selectedSpecialty } : {};
            const data = await appointmentService.getDoctors(selectedSpecialty === 'all' ? undefined : selectedSpecialty);
            setDoctors(data.data || []);
        } catch (error) {
            console.error('Failed to load doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderDoctor = ({ item }: any) => (
        <Card
            style={[
                styles.doctorCard,
                selectedDoctor?._id === item._id && styles.selectedCard
            ]}
            onPress={() => setSelectedDoctor(item)}
        >
            <Card.Content>
                <View style={styles.doctorHeader}>
                    <View style={styles.doctorAvatar}>
                        <Text variant="titleLarge" style={{ color: '#fff' }}>
                            {item.user?.profile?.firstName?.charAt(0)}
                            {item.user?.profile?.lastName?.charAt(0)}
                        </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text variant="titleMedium">
                            Dr. {item.user?.profile?.firstName} {item.user?.profile?.lastName}
                        </Text>
                        <Text variant="bodySmall" style={styles.specialty}>
                            {item.specialization}
                        </Text>
                        <View style={styles.ratingContainer}>
                            <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
                            <Text variant="bodySmall" style={{ marginLeft: 5 }}>
                                {item.rating?.average?.toFixed(1) || 'N/A'} ({item.rating?.count || 0})
                            </Text>
                        </View>
                    </View>
                    {selectedDoctor?._id === item._id && (
                        <MaterialCommunityIcons name="check-circle" size={24} color="#0ea5e9" />
                    )}
                </View>

                <View style={styles.consultationTypes}>
                    {item.consultationTypes?.map((type: string) => (
                        <Chip key={type} mode="outlined" compact style={{ marginRight: 5 }}>
                            {type}
                        </Chip>
                    ))}
                </View>
            </Card.Content>
        </Card>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <View>
                        <Text variant="headlineSmall" style={styles.stepTitle}>
                            Select a Doctor
                        </Text>

                        <Searchbar
                            placeholder="Search doctors..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={styles.searchBar}
                        />

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll}>
                            {specialties.map((specialty) => (
                                <Chip
                                    key={specialty}
                                    selected={selectedSpecialty === specialty.toLowerCase()}
                                    onPress={() => setSelectedSpecialty(specialty.toLowerCase())}
                                    style={styles.specialtyChip}
                                >
                                    {specialty}
                                </Chip>
                            ))}
                        </ScrollView>

                        <FlatList
                            data={doctors}
                            renderItem={renderDoctor}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.doctorList}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Text>No doctors found</Text>
                                </View>
                            }
                        />
                    </View>
                );

            case 2:
                return (
                    <View>
                        <Text variant="headlineSmall" style={styles.stepTitle}>
                            Choose Appointment Type
                        </Text>

                        <Card style={styles.typeCard}>
                            <Card.Content>
                                <RadioButton.Group
                                    onValueChange={setAppointmentType}
                                    value={appointmentType}
                                >
                                    <View style={styles.radioOption}>
                                        <RadioButton value="presencial" />
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text variant="titleMedium">In-Person Visit</Text>
                                            <Text variant="bodySmall" style={{ color: '#666' }}>
                                                Visit the clinic for your appointment
                                            </Text>
                                        </View>
                                        <MaterialCommunityIcons name="hospital-building" size={24} color="#666" />
                                    </View>

                                    <View style={styles.radioOption}>
                                        <RadioButton value="online" />
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text variant="titleMedium">Video Consultation</Text>
                                            <Text variant="bodySmall" style={{ color: '#666' }}>
                                                Connect with doctor via video call
                                            </Text>
                                        </View>
                                        <MaterialCommunityIcons name="video" size={24} color="#666" />
                                    </View>
                                </RadioButton.Group>
                            </Card.Content>
                        </Card>
                    </View>
                );

            case 3:
                return (
                    <View>
                        <Text variant="headlineSmall" style={styles.stepTitle}>
                            Confirmation
                        </Text>

                        <Card style={styles.summaryCard}>
                            <Card.Content>
                                <Text variant="titleMedium" style={{ marginBottom: 15 }}>
                                    Appointment Summary
                                </Text>

                                <View style={styles.summaryRow}>
                                    <MaterialCommunityIcons name="doctor" size={20} color="#666" />
                                    <Text variant="bodyMedium" style={{ marginLeft: 10 }}>
                                        Dr. {selectedDoctor?.user?.profile?.lastName}
                                    </Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <MaterialCommunityIcons name="hospital" size={20} color="#666" />
                                    <Text variant="bodyMedium" style={{ marginLeft: 10 }}>
                                        {selectedDoctor?.specialization}
                                    </Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <MaterialCommunityIcons
                                        name={appointmentType === 'online' ? 'video' : 'hospital-building'}
                                        size={20}
                                        color="#666"
                                    />
                                    <Text variant="bodyMedium" style={{ marginLeft: 10 }}>
                                        {appointmentType === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                                    </Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                                    <Text variant="bodyMedium" style={{ marginLeft: 10 }}>
                                        December 15, 2024 at 10:00 AM
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>

                        <Button
                            mode="contained"
                            onPress={handleBookAppointment}
                            style={styles.confirmButton}
                            contentStyle={{ paddingVertical: 8 }}
                        >
                            Confirm Appointment
                        </Button>
                    </View>
                );

            default:
                return null;
        }
    };

    const handleBookAppointment = () => {
        // TODO: Call API to book appointment
        navigation.navigate('Appointments');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium">Book Appointment</Text>
                <Text variant="bodyMedium" style={{ color: '#666', marginTop: 5 }}>
                    Step {step} of 3
                </Text>
            </View>

            <View style={styles.progressBar}>
                <View style={[styles.progressStep, step >= 1 && styles.activeStep]} />
                <View style={[styles.progressStep, step >= 2 && styles.activeStep]} />
                <View style={[styles.progressStep, step >= 3 && styles.activeStep]} />
            </View>

            <ScrollView style={styles.content}>
                {renderStepContent()}
            </ScrollView>

            <View style={styles.footer}>
                {step > 1 && (
                    <Button
                        mode="outlined"
                        onPress={() => setStep(step - 1)}
                        style={{ flex: 1, marginRight: 10 }}
                    >
                        Back
                    </Button>
                )}
                {step < 3 && (
                    <Button
                        mode="contained"
                        onPress={() => setStep(step + 1)}
                        disabled={step === 1 && !selectedDoctor}
                        style={{ flex: 1 }}
                    >
                        Next
                    </Button>
                )}
            </View>
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
    progressBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        gap: 10,
    },
    progressStep: {
        flex: 1,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
    },
    activeStep: {
        backgroundColor: '#0ea5e9',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    stepTitle: {
        marginBottom: 20,
        fontWeight: 'bold',
    },
    searchBar: {
        marginBottom: 15,
    },
    specialtyScroll: {
        marginBottom: 15,
    },
    specialtyChip: {
        marginRight: 10,
    },
    doctorList: {
        paddingBottom: 20,
    },
    doctorCard: {
        marginBottom: 15,
    },
    selectedCard: {
        borderColor: '#0ea5e9',
        borderWidth: 2,
    },
    doctorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    doctorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#0ea5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    specialty: {
        color: '#666',
        marginTop: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    consultationTypes: {
        flexDirection: 'row',
        marginTop: 10,
        flexWrap: 'wrap',
    },
    typeCard: {
        marginBottom: 20,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    summaryCard: {
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    confirmButton: {
        marginTop: 10,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
});
