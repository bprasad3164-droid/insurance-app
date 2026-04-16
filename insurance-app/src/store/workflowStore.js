import { create } from 'zustand';
import api from '../api/api';

const useWorkflowStore = create((set, get) => ({
    appointments: [],
    claims: [],
    renewals: [],
    openTasks: { appointments: [], claims: [], renewals: [] },
    loading: false,

    fetchMyAppointments: async () => {
        const res = await api.get('/appointments/my/');
        set({ appointments: res.data });
    },

    bookAppointment: async (data) => {
        await api.post('/appointments/create/', data);
        get().fetchMyAppointments();
    },

    fetchOpenTasks: async () => {
        const res = await api.get('/tasks/open/');
        set({ openTasks: res.data });
    },

    assignTask: async (assignData) => {
        await api.post('/tasks/assign/', assignData);
        get().fetchOpenTasks();
    }
}));

export default useWorkflowStore;
