import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import ApplicationCard from "./ApplicationCard";
import styles from "./MyApplications.module.css";

function MyApplications() {
    const { token } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [banner, setBanner] = useState(null); // { type: "success"|"blocked"|"info", message }

    const fetchApplications = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/applications/mine`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not load your applications.");
                return;
            }

            setError("");
            setApplications(data.data || []);
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchApplications();
    }, [token, fetchApplications]);

    function handleResolved(type, message) {
        setBanner({ type, message });
        fetchApplications();
    }

    if (loading) return <p>Loading your applications...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    const bannerClass =
        banner?.type === "success"
            ? styles.bannerSuccess
            : banner?.type === "info"
            ? styles.bannerInfo
            : styles.bannerError;

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.heading}>My Applications</h2>

            {banner && <div className={bannerClass}>{banner.message}</div>}

            {applications.length === 0 && <p>You haven't applied to any drives yet.</p>}

            {applications.map((app) => (
                <ApplicationCard key={app.id} app={app} onResolved={handleResolved} />
            ))}
        </div>
    );
}

export default MyApplications;