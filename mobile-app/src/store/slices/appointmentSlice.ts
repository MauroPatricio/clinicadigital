import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Appointment {
    _id: string;
    dateTime: string;
    type: string;
    doctor: any;
    status: string;
    reason: string;
}

interface AppointmentState {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
}

const initialState: AppointmentState = {
    appointments: [],
    loading: false,
    error: null,
};

const appointmentSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        setAppointments: (state, action: PayloadAction<Appointment[]>) => {
            state.appointments = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setAppointments, setLoading, setError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
