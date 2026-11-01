import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MANAGEMENT_ROLES = ["ADMIN", "MANAGER"];

const styles = {
    nav: {
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        padding: "0 2rem",
        height: "56px",
        background: "#1f2937",
    },
    brand: { color: "#fff", fontWeight: 700, marginRight: "auto" },
    link: { color: "#9ca3af", textDecoration: "none", fontWeight: 500 },
    active: { color: "#fff", borderBottom: "2px solid #3b82f6" },
    userBox: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginLeft: "0.5rem",
        paddingLeft: "1.5rem",
        borderLeft: "1px solid #374151",
    },
    userName: { color: "#fff", fontSize: "0.9rem", fontWeight: 500 },
    role: { color: "#9ca3af", fontSize: "0.75rem", marginLeft: "0.4rem" },
    logout: {
        padding: "0.35rem 0.8rem",
        border: "1px solid #4b5563",
        borderRadius: "6px",
        background: "transparent",
        color: "#e5e7eb",
        fontWeight: 500,
        cursor: "pointer",
    },
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Nothing to show on the login page
    if (!user) return null;

    const canManage = MANAGEMENT_ROLES.includes(user.role);

    const linkStyle = ({ isActive }) =>
        isActive ? { ...styles.link, ...styles.active } : styles.link;

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <nav style={styles.nav}>
            <span style={styles.brand}>IT Equipment Tracker</span>

            <NavLink to="/" end style={linkStyle}>
                Dashboard
            </NavLink>
            {canManage && (
                <>
                    <NavLink to="/users" style={linkStyle}>
                        Users
                    </NavLink>
                    <NavLink to="/equipment" style={linkStyle}>
                        Equipment
                    </NavLink>
                </>
            )}

            <div style={styles.userBox}>
        <span style={styles.userName}>
          {user.firstName} {user.lastName}
            <span style={styles.role}>{user.role}</span>
        </span>
                <button style={styles.logout} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}