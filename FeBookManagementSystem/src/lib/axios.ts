import { BACKEND_URL } from "@env";
import axios from "axios";
import EncryptedStorage from "react-native-encrypted-storage";

const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: 5000,
})

api.interceptors.request.use(async (config) => {
    const accessToken = await EncryptedStorage.getItem('accessToken')
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config;
}, (error) => {
    return Promise.reject(error)
})

api.interceptors.response.use(async (response) =>
    response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            try {
                const refreshToken = await EncryptedStorage.getItem('refreshToken');

                const res = await api.post('/auth/refresh', { refreshToken: refreshToken })

                await EncryptedStorage.setItem('accessToken', res.data.accessToken)

                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`

                return api(originalRequest)
            } catch (refreshError) {
                await EncryptedStorage.clear()
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error);
    }
)

export default api;