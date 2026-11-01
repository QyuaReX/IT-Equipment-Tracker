import axios from "axios";

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
    headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Expired/invalid token on a protected call: drop the session and go to login.
// Login/register failures also return 401, so those are excluded.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthCall = error.config?.url?.startsWith("/auth/");
        if (error.response?.status === 401 && !isAuthCall) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            if (window.location.pathname !== "/login") {
                window.location.assign("/login");
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (credentials) =>
    api.post("/auth/login", credentials).then((res) => res.data);

export const register = (userData) =>
    api.post("/auth/register", userData).then((res) => res.data);

// Users
export const getUsers = () => api.get("/users").then((res) => res.data);

export const createUser = (userData) =>
    api.post("/users", userData).then((res) => res.data);

// Equipment
export const getEquipment = () => api.get("/equipment").then((res) => res.data);

export const createEquipment = (equipmentData) =>
    api.post("/equipment", equipmentData).then((res) => res.data);

// Checkouts
export const checkoutEquipment = (userId, equipmentId) =>
    api.post("/checkouts", { userId, equipmentId }).then((res) => res.data);

export const returnEquipment = (checkoutId) =>
    api.post(`/checkouts/${checkoutId}/return`).then((res) => res.data);

export const getActiveCheckout = (equipmentId) =>
    api
        .get("/checkouts/active", { params: { equipmentId } })
        .then((res) => res.data);

// Reservations: { equipmentId, startDate, endDate } with dates as "YYYY-MM-DD".
// The reserving user comes from the JWT, not from the request body.
export const createReservation = (reservationData) =>
    api.post("/reservations", reservationData).then((res) => res.data);

// Pulls a readable message out of an error. Spring Security's own 401/403
// responses have no JSON body, so those are handled explicitly.
export const extractErrorMessage = (err) => {
    if (err.response) {
        if (err.response.status === 403) {
            return "You do not have permission to perform this action.";
        }
        return err.response.data?.message ?? `Request failed (${err.response.status})`;
    }
    return "Could not reach the server. Is the API running?";
};

export default api;