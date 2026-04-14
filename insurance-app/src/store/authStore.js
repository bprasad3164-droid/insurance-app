import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
    user: null,
    role: localStorage.getItem('role') || null,
    token: localStorage.getItem('access') || null,
    isAuthenticated: !!localStorage.getItem('access'),
    loading: false,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/login/', { email, password });
            const { access, refresh, role, kyc_status } = res.data;
            
            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);
            localStorage.setItem('role', role);

            set({
                token: access,
                role: role,
                isAuthenticated: true,
                user: { email, kyc_status },
                loading: false
            });
            return true;
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },

    logout: () => {
        localStorage.clear();
        set({ user: null, role: null, token: null, isAuthenticated: false });
        window.location.href = '/login';
    },

    init: () => {
        const token = localStorage.getItem('access');
        const role = localStorage.getItem('role');
        if (token) {
            set({ token, role, isAuthenticated: true });
        }
    }
}));

export default useAuthStore;
