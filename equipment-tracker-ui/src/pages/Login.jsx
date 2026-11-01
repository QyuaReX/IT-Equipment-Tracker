import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    extractErrorMessage,
    login as loginRequest,
    register as registerRequest,
} from "../services/api";

const EMPTY_FORM = { firstName: "", lastName: "", email: "", password: "" };

const styles = {
    wrapper: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
    },
    card: {
        width: "100%",
        maxWidth: "400px",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1.75rem",
    },
    title: { margin: "0 0 0.25rem", textAlign: "center" },
    subtitle: {
        margin: "0 0 1.25rem",
        textAlign: "center",
        color: "#6b7280",
        fontSize: "0.9rem",
    },
    tabs: {
        display: "flex",
        marginBottom: "1.25rem",
        borderBottom: "1px solid #e5e7eb",
    },
    tab: {
        flex: 1,
        padding: "0.6rem",
        background: "none",
        border: "none",
        borderBottom: "2px solid transparent",
        color: "#6b7280",
        fontWeight: 600,
        cursor: "pointer",
    },
    tabActive: { color: "#2563eb", borderBottomColor: "#2563eb" },
    form: { display: "flex", flexDirection: "column", gap: "0.85rem" },
    nameRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "#374151",
    },
    input: {
        padding: "0.55rem",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "0.95rem",
    },
    button: {
        marginTop: "0.25rem",
        padding: "0.65rem 1rem",
        border: "none",
        borderRadius: "6px",
        background: "#2563eb",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
    },
    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "0.75rem 1rem",
        borderRadius: "6px",
        marginBottom: "1rem",
        fontSize: "0.9rem",
    },
    switchText: {
        marginTop: "1.1rem",
        textAlign: "center",
        fontSize: "0.875rem",
        color: "#6b7280",
    },
    link: {
        background: "none",
        border: "none",
        padding: 0,
        color: "#2563eb",
        fontWeight: 600,
        cursor: "pointer",
    },
};

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const location = useLocation();

    const [mode, setMode] = useState("login"); // "login" | "register"
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isRegister = mode === "register";
    // Where the user was headed before ProtectedRoute bounced them here
    const from = location.state?.from?.pathname ?? "/";

    // Already logged in (or just logged in): leave the login page
    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    const switchMode = (next) => {
        setMode(next);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const data = isRegister
                ? await registerRequest(form)
                : await loginRequest({ email: form.email, password: form.password });
            login(data); // updates context; the <Navigate> above handles the redirect
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <h2 style={styles.title}>IT Equipment Tracker</h2>
                <p style={styles.subtitle}>
                    {isRegister ? "Create your account" : "Sign in to continue"}
                </p>

                <div style={styles.tabs}>
                    <button
                        type="button"
                        style={{ ...styles.tab, ...(!isRegister ? styles.tabActive : {}) }}
                        onClick={() => switchMode("login")}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        style={{ ...styles.tab, ...(isRegister ? styles.tabActive : {}) }}
                        onClick={() => switchMode("register")}
                    >
                        Register
                    </button>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                <form style={styles.form} onSubmit={handleSubmit}>
                    {isRegister && (
                        <div style={styles.nameRow}>
                            <label style={styles.label}>
                                First name
                                <input
                                    style={styles.input}
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label style={styles.label}>
                                Last name
                                <input
                                    style={styles.input}
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>
                    )}

                    <label style={styles.label}>
                        Email
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label style={styles.label}>
                        Password
                        <input
                            style={styles.input}
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete={isRegister ? "new-password" : "current-password"}
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        style={{ ...styles.button, opacity: submitting ? 0.6 : 1 }}
                        disabled={submitting}
                    >
                        {submitting ? "Please wait..." : isRegister ? "Create account" : "Login"}
                    </button>
                </form>

                <p style={styles.switchText}>
                    {isRegister ? "Already have an account? " : "Don't have an account? "}
                    <button
                        type="button"
                        style={styles.link}
                        onClick={() => switchMode(isRegister ? "login" : "register")}
                    >
                        {isRegister ? "Login" : "Register"}
                    </button>
                </p>
            </div>
        </div>
    );
}