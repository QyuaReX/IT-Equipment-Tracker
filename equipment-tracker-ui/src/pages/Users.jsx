import { useCallback, useEffect, useState } from "react";
import { createUser, extractErrorMessage, getUsers } from "../services/api";

const ROLES = ["EMPLOYEE", "MANAGER", "ADMIN"];

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
};

const ROLE_COLORS = {
    ADMIN: { background: "#ede9fe", color: "#5b21b6" },
    MANAGER: { background: "#dbeafe", color: "#1e40af" },
    EMPLOYEE: { background: "#f3f4f6", color: "#374151" },
};

const styles = {
    page: { maxWidth: "900px", margin: "0 auto", padding: "2rem" },
    card: {
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1rem 1.25rem",
        background: "#fff",
        marginBottom: "1.5rem",
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "0.75rem",
        alignItems: "end",
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "#374151",
    },
    input: {
        padding: "0.5rem",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "0.95rem",
    },
    button: {
        padding: "0.55rem 1rem",
        border: "none",
        borderRadius: "6px",
        background: "#2563eb",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
    },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
    th: {
        textAlign: "left",
        padding: "0.65rem 0.75rem",
        borderBottom: "2px solid #e5e7eb",
        fontSize: "0.8rem",
        textTransform: "uppercase",
        color: "#6b7280",
    },
    td: { padding: "0.65rem 0.75rem", borderBottom: "1px solid #f3f4f6" },
    badge: {
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
    },
    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "0.75rem 1rem",
        borderRadius: "6px",
        marginBottom: "1rem",
    },
    success: {
        background: "#dcfce7",
        color: "#166534",
        padding: "0.75rem 1rem",
        borderRadius: "6px",
        marginBottom: "1rem",
    },
};

export default function Users() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const loadUsers = useCallback(async () => {
        try {
            setUsers(await getUsers());
        } catch (err) {
            setError(extractErrorMessage(err));
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadUsers();
            setLoading(false);
        };
        init();
    }, [loadUsers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const created = await createUser(form);
            setSuccess(`User "${created.firstName} ${created.lastName}" created.`);
            setForm(EMPTY_FORM);
            await loadUsers();
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.page}>
            <h1>Users</h1>

            <form style={styles.card} onSubmit={handleSubmit}>
                <h3 style={{ marginTop: 0 }}>Add user</h3>
                <div style={styles.formGrid}>
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
                    <label style={styles.label}>
                        Email
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
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
                            autoComplete="new-password"
                            required
                        />
                    </label>
                    <label style={styles.label}>
                        Role
                        <select
                            style={styles.input}
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                        >
                            {ROLES.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="submit"
                        style={{ ...styles.button, opacity: submitting ? 0.6 : 1 }}
                        disabled={submitting}
                    >
                        {submitting ? "Saving..." : "Add user"}
                    </button>
                </div>
            </form>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}
            {loading && <p>Loading users...</p>}
            {!loading && users.length === 0 && !error && <p>No users yet.</p>}

            {users.length > 0 && (
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Role</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td style={styles.td}>{user.id}</td>
                            <td style={styles.td}>
                                {user.firstName} {user.lastName}
                            </td>
                            <td style={styles.td}>{user.email}</td>
                            <td style={styles.td}>
                  <span style={{ ...styles.badge, ...ROLE_COLORS[user.role] }}>
                    {user.role}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}