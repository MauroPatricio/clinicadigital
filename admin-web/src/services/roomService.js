import api from './api';

// Get all rooms for current clinic
export const getRooms = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);

    const queryString = params.toString();
    const url = queryString ? `/rooms?${queryString}` : '/rooms';

    const response = await api.get(url);
    return response.data;
};

// Get single room
export const getRoom = async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
};

// Create room
export const createRoom = async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
};

// Update room
export const updateRoom = async (roomId, roomData) => {
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
};

// Delete room
export const deleteRoom = async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
};

// Occupy room
export const occupyRoom = async (roomId, appointmentId, staffId) => {
    const response = await api.post(`/rooms/${roomId}/occupy`, {
        appointmentId,
        staffId
    });
    return response.data;
};

// Free room
export const freeRoom = async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/free`);
    return response.data;
};

// Get occupancy stats
export const getRoomOccupancyStats = async () => {
    const response = await api.get('/rooms/stats/occupancy');
    return response.data;
};
