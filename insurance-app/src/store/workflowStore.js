import { create } from 'zustand';
import axios from 'axios';

const useWorkflowStore = create((set, get) => ({
    appointments: [],
    claims: [],
    renewals: [],
    openTasks: { appointments: [], claims: [], renewals: [] },
    loading: false,

    fetchMyAppointments: async () => {
        const token = localStorage.getItem('access');
        const res = await axios.get('http://127.0.0.1:8000/api/appointments/my/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        set({ appointments: res.data });
    },

    bookAppointment: async (data) => {
        const token = localStorage.getItem('access');
        await axios.post('http://127.0.0.1:8000/api/appointments/create/', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        get().fetchMyAppointments();
    },

    fetchOpenTasks: async () => {
        const token = localStorage.getItem('access');
        const res = await axios.get('http://127.0.0.1:8000/api/tasks/open/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        set({ openTasks: res.data });
    },

    assignTask: async (assignData) => {
        const token = localStorage.getItem('access');
        await axios.post('http://127.0.0.1:8000/api/tasks/assign/', assignData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        get().fetchOpenTasks();
    }
}));

export default useWorkflowStore;
