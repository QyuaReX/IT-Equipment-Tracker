import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    checkoutEquipment,
    createReservation,
    extractErrorMessage,
    getActiveCheckout,
    getEquipment,
    returnEquipment,
} from "../services/api";

const EMPTY_DATES = { startDate: "", endDate: "" };

const STATUS_COLORS = {
    AVAILABLE: { background: "#dcfce7", color: "#166534" },
    CHECKED_OUT: { background: "#fee2e2", color: "#991b1b" },
    MAINTENANCE: { background: "#fef9c3", color: "#854d0e" },
};

// LocalDateTime strings have no timezone and can carry microseconds;
// trimming to seconds parses consistently across browsers.
const formatDate = (value) => {
    const date = new Date(value.slice(0, 19));
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

// Today as YYYY-MM-DD in the browser's local time (for the date inputs' min)
const todayISO = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const styles = {
    page: { maxWidth: "900px", margin: "0 auto", padding: "2rem" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1rem",
    },
    card: {
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1rem",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    meta: { margin: 0, color: "#6b7280", fontSize: "0.875rem" },
    checkoutInfo: { margin: 0, color: "#6b7280", fontSize: "0.8rem" },
    badge: {
        alignSelf: "flex-start",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
    },
    actions: {
        marginTop: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    buttonRow: { display: "flex", gap: "0.5rem" },
    button: {
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: "6px",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
    },
    buttonFlex: { flex: 1 },
    reserveForm: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "0.75rem",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        background: "#f9fafb",
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        fontSize: "0.8rem",
        fontWeight: 500,
        color: "#374151",
    },
    input: {
        padding: "0.4rem",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "0.9rem",
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

export default function Dashboard() {
    const { user } = useAuth();

    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [busyId, setBusyId] = useState(null);

    // Which card currently has its reservation form open, and the form's dates
    const [reservingId, setReservingId] = useState(null);
    const [dates, setDates] = useState(EMPTY_DATES);

    // equipmentId -> checkoutId, for checkouts made during this session
    const checkoutIds = useRef({});

    const loadEquipment = useCallback(async () => {
        try {
            setEquipment(await getEquipment());
        } catch (err) {
            setError(extractErrorMessage(err));
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadEquipment();
            setLoading(false);
        };
        init();
    }, [loadEquipment]);

    const handleCheckout = async (item) => {
        setBusyId(item.id);
        setError(null);
        setSuccess(null);
        try {
            const checkout = await checkoutEquipment(user.id, item.id);
            checkoutIds.current[item.id] = checkout.id;
            await loadEquipment();
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    const handleReturn = async (item) => {
        setBusyId(item.id);
        setError(null);
        setSuccess(null);
        try {
            let checkoutId = checkoutIds.current[item.id];
            if (!checkoutId) {
                // e.g. after a page refresh: ask the backend for the active checkout
                const active = await getActiveCheckout(item.id);
                checkoutId = active.id;
            }
            await returnEquipment(checkoutId);
            delete checkoutIds.current[item.id];
            await loadEquipment();
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    const toggleReserve = (itemId) => {
        setError(null);
        setSuccess(null);
        setDates(EMPTY_DATES);
        setReservingId((current) => (current === itemId ? null : itemId));
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDates((prev) => ({ ...prev, [name]: value }));
    };

    const handleReserve = async (e, item) => {
        e.preventDefault();
        setBusyId(item.id);
        setError(null);
        setSuccess(null);
        try {
            const reservation = await createReservation({
                equipmentId: item.id,
                startDate: dates.startDate,
                endDate: dates.endDate,
            });
            setSuccess(
                `Reserved ${item.name} from ${reservation.startDate} to ${reservation.endDate}.`
            );
            setReservingId(null);
            setDates(EMPTY_DATES);
        } catch (err) {
            // e.g. overlapping dates: shown in the banner, the form stays open to adjust
            setError(extractErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    const renderAction = (item) => {
        const busy = busyId === item.id;

        if (item.status === "AVAILABLE") {
            const reserving = reservingId === item.id;

            return (
                <>
                    <div style={styles.buttonRow}>
                        <button
                            style={{
                                ...styles.button,
                                ...styles.buttonFlex,
                                background: "#2563eb",
                                opacity: busy ? 0.6 : 1,
                            }}
                            disabled={busy}
                            onClick={() => handleCheckout(item)}
                        >
                            {busy && !reserving ? "Checking out..." : "Checkout"}
                        </button>
                        <button
                            style={{
                                ...styles.button,
                                ...styles.buttonFlex,
                                background: reserving ? "#6b7280" : "#7c3aed",
                                opacity: busy ? 0.6 : 1,
                            }}
                            disabled={busy}
                            onClick={() => toggleReserve(item.id)}
                        >
                            {reserving ? "Cancel" : "Reserve"}
                        </button>
                    </div>

                    {reserving && (
                        <form style={styles.reserveForm} onSubmit={(e) => handleReserve(e, item)}>
                            <label style={styles.label}>
                                Start date
                                <input
                                    style={styles.input}
                                    type="date"
                                    name="startDate"
                                    value={dates.startDate}
                                    min={todayISO()}
                                    onChange={handleDateChange}
                                    required
                                />
                            </label>
                            <label style={styles.label}>
                                End date
                                <input
                                    style={styles.input}
                                    type="date"
                                    name="endDate"
                                    value={dates.endDate}
                                    min={dates.startDate || todayISO()}
                                    onChange={handleDateChange}
                                    required
                                />
                            </label>
                            <button
                                type="submit"
                                style={{ ...styles.button, background: "#7c3aed", opacity: busy ? 0.6 : 1 }}
                                disabled={busy}
                            >
                                {busy ? "Reserving..." : "Submit reservation"}
                            </button>
                        </form>
                    )}
                </>
            );
        }

        if (item.status === "CHECKED_OUT") {
            return (
                <button
                    style={{ ...styles.button, background: "#059669", opacity: busy ? 0.6 : 1 }}
                    disabled={busy}
                    onClick={() => handleReturn(item)}
                >
                    {busy ? "Returning..." : "Return"}
                </button>
            );
        }

        return <p style={styles.meta}>Unavailable (maintenance)</p>;
    };

    return (
        <div style={styles.page}>
            <h1>Dashboard</h1>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}
            {loading && <p>Loading equipment...</p>}
            {!loading && equipment.length === 0 && !error && <p>No equipment found.</p>}

            <div style={styles.grid}>
                {equipment.map((item) => (
                    <div key={item.id} style={styles.card}>
                        <h3 style={{ margin: 0 }}>{item.name}</h3>
                        <p style={styles.meta}>
                            {item.category} · {item.assetTag ?? "No asset tag"}
                        </p>
                        {item.serialNumber && (
                            <p style={styles.meta}>S/N: {item.serialNumber}</p>
                        )}
                        <span style={{ ...styles.badge, ...STATUS_COLORS[item.status] }}>
              {item.status.replace("_", " ")}
            </span>
                        {item.status === "CHECKED_OUT" && item.activeCheckoutUserName && (
                            <p style={styles.checkoutInfo}>
                                Checked out by: {item.activeCheckoutUserName}
                                {item.activeCheckoutDate &&
                                    ` on ${formatDate(item.activeCheckoutDate)}`}
                            </p>
                        )}
                        <div style={styles.actions}>{renderAction(item)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}