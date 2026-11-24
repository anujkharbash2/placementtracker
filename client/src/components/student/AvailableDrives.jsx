import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import { formatDeadline } from "../../utils/driveDates";
import DriveCard from "../common/DriveCard";
import DriveDetails from "../common/DriveDetails";
import FilterTabs from "../common/FilterTabs";
import Button from "../common/Button";
import ApplyModal from "./ApplyModal";
import styles from "./AvailableDrives.module.css";
import { usePlacementStatus } from "../../hooks/usePlacementStatus";

const FILTERS = [
    { value: "all", label: "All drives" },
    { value: "eligible", label: "Only drives I'm eligible for" },
];

function getStatus(drive) {
    if (drive.already_applied) return { key: "applied", label: "Applied", canApply: false };
    if (!drive.is_eligible) return { key: "notEligible", label: "Not eligible", canApply: false };
    return { key: "eligible", label: "Apply", canApply: true };
}

function AvailableDrives({ onGoToProfile }) {
    const { token } = useAuth();
    const isPlaced = usePlacementStatus();   // ← moved here, inside the component

    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [profileIncomplete, setProfileIncomplete] = useState(false);

    const [applyingDrive, setApplyingDrive] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const fetchDrives = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/drives/available`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not load drives.");
                return;
            }

            setError("");
            setDrives(data.data || []);
            setProfileIncomplete(!!data.profile_incomplete);
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchDrives();
    }, [token, fetchDrives]);

    function handleApplied() {
        setSuccessMessage(`Your application to "${applyingDrive.title}" was submitted.`);
        setApplyingDrive(null);
        fetchDrives();
    }

    if (loading) return <p>Loading drives...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    const visibleDrives =
        filter === "eligible" ? drives.filter((d) => d.is_eligible) : drives;

    return (
        <div className={styles.wrapper}>
            {isPlaced && (
                <div className={styles.banner}>
                    You're already placed, so applying to new drives is closed.
                </div>
            )}

            {profileIncomplete && (
                <div className={styles.banner}>
                    Your profile is incomplete, so eligibility may be inaccurate.{" "}
                    <button type="button" className={styles.bannerLink} onClick={onGoToProfile}>
                        Complete your profile
                    </button>
                </div>
            )}

            {successMessage && <div className={styles.success}>{successMessage}</div>}

            <FilterTabs options={FILTERS} value={filter} onChange={setFilter} />

            {visibleDrives.length === 0 && (
                <p>
                    {filter === "eligible"
                        ? "No drives match your profile right now."
                        : "No drives are open right now."}
                </p>
            )}

            <div className={styles.list}>
                {visibleDrives.map((drive) => {
                    const status = getStatus(drive);
                    const reasons = drive.ineligible_reasons || [];

                    return (
                        <DriveCard
                            key={drive.id}
                            summary={
                                <div>
                                    <h4>{drive.title}</h4>
                                    <p>
                                        {drive.company_name} · {drive.type} · Apply by:{" "}
                                        {formatDeadline(drive.application_deadline)}
                                    </p>
                                </div>
                            }
                            badge={
                                <span className={`${styles.badge} ${styles[status.key]}`}>
                                    {status.key === "eligible" ? "Eligible" : status.label}
                                </span>
                            }
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
                            </div>

                            <DriveDetails drive={drive} />

                            <div className={styles.applyBlock}>
                                <Button
                                    type="button"
                                    variant="primary"
                                    disabled={isPlaced || !status.canApply}
                                    onClick={() => {
                                        setSuccessMessage("");
                                        setApplyingDrive(drive);
                                    }}
                                >
                                    {isPlaced ? "Already placed" : status.label}
                                </Button>

                                {!drive.is_eligible && reasons.length > 0 && (
                                    <ul className={styles.reasons}>
                                        {reasons.map((reason, i) => (
                                            <li key={i}>{reason}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </DriveCard>
                    );
                })}
            </div>

            {applyingDrive && (
                <ApplyModal
                    drive={applyingDrive}
                    onClose={() => setApplyingDrive(null)}
                    onApplied={handleApplied}
                    onRefreshNeeded={fetchDrives}
                />
            )}
        </div>
    );
}

export default AvailableDrives;