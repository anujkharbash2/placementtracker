import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import { isDriveClosed, formatDeadline } from "../../utils/driveDates";
import DriveCard from "../common/DriveCard";
import DriveDetails from "../common/DriveDetails";
import FilterTabs from "../common/FilterTabs";
import StatusBadge from "../common/StatusBadge";
import ReviewActions from "./ReviewActions";
import styles from "./PendingDrives.module.css";

const TIMING_FILTERS = [
    { value: "all", label: "All dates" },
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past deadline" },
];

function PendingDrives() {
    const { token } = useAuth();
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [timingFilter, setTimingFilter] = useState("all");

    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${API_BASE_URL}/api/drives/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not load pending drives.");
                return;
            }

            setDrives(data.data || []);
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    if (loading) return <p>Loading pending drives...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (drives.length === 0) return <p>No drives awaiting approval.</p>;

    const visibleDrives = drives.filter((drive) => {
        const closed = isDriveClosed(drive);
        if (timingFilter === "upcoming") return !closed;
        if (timingFilter === "past") return closed;
        return true;
    });

    return (
        <div className={styles.list}>
            <h2 className={styles.heading}>Pending Drives</h2>

            <div className={styles.filters}>
                <FilterTabs options={TIMING_FILTERS} value={timingFilter} onChange={setTimingFilter} />
            </div>

            {visibleDrives.length === 0 && <p>No drives match this filter.</p>}

            {visibleDrives.map((drive) => (
                <DriveCard
                    key={drive.id}
                    summary={
                        <div>
                            <h4>{drive.title}</h4>
                            <p>
                                {drive.company_name} · {drive.type} · Deadline:{" "}
                                {formatDeadline(drive.application_deadline)}
                            </p>
                        </div>
                    }
                    badge={isDriveClosed(drive) ? <StatusBadge status="closed" label="Deadline passed" /> : null}
                >
                    <div className={styles.companyBlock}>
                        <strong>{drive.company_name}</strong> ({drive.company_industry})
                        {drive.company_website && (
                            <>
                                {" · "}
                                <a href={drive.company_website} target="_blank" rel="noreferrer">
                                    {drive.company_website}
                                </a>
                            </>
                        )}
                        <div>Recruiter: {drive.recruiter_name} — {drive.recruiter_designation}</div>
                    </div>

                    <DriveDetails drive={drive} />

                    <ReviewActions
                        drive={drive}
                        onReviewed={() => setDrives((prev) => prev.filter((d) => d.id !== drive.id))}
                    />
                </DriveCard>
            ))}
        </div>
    );
}

export default PendingDrives;