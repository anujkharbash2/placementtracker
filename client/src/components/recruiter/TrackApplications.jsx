import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import { useDriveRounds } from "../../hooks/useDriveRounds";
import { openResume } from "../../utils/openResume";
import { getOutcomeBadge } from "../../utils/outcomeBadge";
import { formatDateTime } from "../../utils/driveDates";
import DriveCard from "../common/DriveCard";
import Select from "../common/Select";
import Button from "../common/Button";
import FilterTabs from "../common/FilterTabs";
import StatusBadge from "../common/StatusBadge";
import CorrectApplicationModal from "./CorrectApplicationModal";
import OfferDeadlineModal from "./OfferDeadlineModal";
import styles from "./TrackApplications.module.css";

const OUTCOME_LABELS = {
    offer: "Offer",
    offer_accepted: "Offer Accepted",
    offer_declined: "Offer Declined",
    offer_expired: "Offer Expired",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
};

const CLOSED_OUTCOMES = ["offer_accepted", "offer_declined", "rejected", "withdrawn", "offer_expired"];

function TrackApplications({ initialDriveId }) {
    const { token } = useAuth();

    const [drives, setDrives] = useState([]);
    const [drivesLoading, setDrivesLoading] = useState(true);
    const [drivesError, setDrivesError] = useState("");
    const [selectedDriveId, setSelectedDriveId] = useState("");

    const { rounds } = useDriveRounds(selectedDriveId);

    const [applicants, setApplicants] = useState([]);
    const [appsLoading, setAppsLoading] = useState(false);
    const [appsError, setAppsError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const [statusFilter, setStatusFilter] = useState("all");
    const [actioningId, setActioningId] = useState(null);
    const [actionMessage, setActionMessage] = useState("");
    const [correctingApplicant, setCorrectingApplicant] = useState(null);
    const [offeringApplicant, setOfferingApplicant] = useState(null);

    useEffect(() => {
        if (!token) return;

        async function loadDrives() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/drives/mine?status=approved&limit=100`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (!response.ok) {
                    setDrivesError(data.message || "Could not load your drives.");
                    return;
                }

                const list = data.data || [];
                setDrives(list);
                const preferred = initialDriveId && list.find((d) => String(d.id) === String(initialDriveId));
                if (list.length > 0) setSelectedDriveId(String(preferred ? preferred.id : list[0].id));
            } catch (err) {
                setDrivesError("Could not reach the server.");
            } finally {
                setDrivesLoading(false);
            }
        }

        loadDrives();
    }, [token]);

    useEffect(() => {
        if (!token || !selectedDriveId) return;
        let cancelled = false;

        async function loadApplicants() {
            setAppsLoading(true);
            setAppsError("");

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/applications/drive/${selectedDriveId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await response.json();
                if (cancelled) return;

                if (!response.ok) {
                    setAppsError(data.message || "Could not load applicants.");
                    setApplicants([]);
                    return;
                }

                setApplicants(data.data || []);
            } catch (err) {
                if (!cancelled) setAppsError("Could not reach the server.");
            } finally {
                if (!cancelled) setAppsLoading(false);
            }
        }

        loadApplicants();
        return () => {
            cancelled = true;
        };
    }, [token, selectedDriveId, reloadKey]);

    function handleDriveChange(e) {
        setSelectedDriveId(e.target.value);
        setStatusFilter("all");
        setActionMessage("");
    }

    async function sendAction(applicantId, action) {
        setActioningId(applicantId);
        setActionMessage("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/applications/${applicantId}/${action}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (!response.ok) {
                setActionMessage(data.message || `Could not ${action} this application.`);
                setReloadKey((k) => k + 1);
                return;
            }

            setReloadKey((k) => k + 1);
        } catch (err) {
            setActionMessage("Could not reach the server.");
        } finally {
            setActioningId(null);
        }
    }

    function handleAdvance(applicant) {
        sendAction(applicant.id, "advance");
    }

    function handleReject(applicant) {
        if (!window.confirm(`Reject ${applicant.name}'s application?`)) return;
        sendAction(applicant.id, "reject");
    }

    async function handleViewResume(applicant) {
        setActionMessage("");
        const message = await openResume(applicant.resume_id, token);
        if (message) setActionMessage(message);
    }

    if (drivesLoading) return <p>Loading your drives...</p>;
    if (drivesError) return <p className={styles.error}>{drivesError}</p>;
    if (drives.length === 0) {
        return <p>You have no approved drives yet. Applicants appear here once a drive is approved.</p>;
    }

    const roundLabel = (order) => {
        const found = rounds.find((r) => r.round_order === order);
        return found ? found.name : `Round ${order}`;
    };

    const filterKey = (a) =>
        a.outcome === "in_progress" ? `round-${a.current_round_order}` : a.outcome;

    const rank = (k) => {
        if (k.startsWith("round-")) return Number(k.replace("round-", ""));
        const order = {
            offer: 1000,
            offer_accepted: 1001,
            offer_declined: 1002,
            offer_expired: 1003,
            rejected: 1004,
            withdrawn: 1005,
        };
        return order[k] ?? 2000;
    };

    const presentKeys = [...new Set(applicants.map(filterKey))].sort((a, b) => rank(a) - rank(b));

    const statusFilters = [
        { value: "all", label: "All" },
        ...presentKeys.map((key) => ({
            value: key,
            label: key.startsWith("round-")
                ? roundLabel(Number(key.replace("round-", "")))
                : OUTCOME_LABELS[key] || key,
        })),
    ];

    const activeFilter = presentKeys.includes(statusFilter) ? statusFilter : "all";
    const visibleApplicants =
        activeFilter === "all" ? applicants : applicants.filter((a) => filterKey(a) === activeFilter);

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.heading}>Applicants</h2>

            <Select
                label="Drive"
                id="applicantDrive"
                value={selectedDriveId}
                onChange={handleDriveChange}
                options={drives.map((d) => ({ value: String(d.id), label: d.title }))}
            />

            {applicants.length > 0 && (
                <FilterTabs options={statusFilters} value={activeFilter} onChange={setStatusFilter} />
            )}

            {actionMessage && <div className={styles.actionError}>{actionMessage}</div>}

            {appsLoading && <p>Loading applicants...</p>}
            {appsError && <p className={styles.error}>{appsError}</p>}
            {!appsLoading && !appsError && applicants.length === 0 && (
                <p>No one has applied to this drive yet.</p>
            )}

            <div className={styles.list}>
                {visibleApplicants.map((a) => {
                    const badge = getOutcomeBadge(a);
                    const isLastRound = Number(a.current_round_order) === Number(a.total_rounds);

                    return (
                        <DriveCard
                            key={a.id}
                            summary={
                                <div>
                                    <h4>{a.name}</h4>
                                    <p>
                                        {a.roll_number} · {a.degree}
                                        {a.branch ? ` · ${a.branch}` : ""}
                                    </p>
                                </div>
                            }
                            badge={<StatusBadge status={badge.status} label={badge.label} />}
                        >
                            <div className={styles.grid}>
                                <div><strong>Email:</strong> {a.email}</div>
                                <div><strong>Mobile:</strong> {a.mobile_number}</div>
                                <div><strong>CGPA:</strong> {a.cgpa}</div>
                                <div><strong>Active backlogs:</strong> {a.active_backlogs}</div>
                                <div><strong>Passing year:</strong> {a.passing_year}</div>
                                <div>
                                    <strong>Round:</strong> {a.current_round_name} ({a.current_round_order} of{" "}
                                    {a.total_rounds})
                                </div>
                                {a.outcome === "offer" && a.offer_expires_at && (
                                    <div><strong>Response due:</strong> {formatDateTime(a.offer_expires_at)}</div>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!a.resume_id}
                                    onClick={() => handleViewResume(a)}
                                >
                                    View resume
                                </Button>

                                {a.outcome === "in_progress" && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            disabled={isLastRound || actioningId === a.id}
                                            onClick={() => handleAdvance(a)}
                                        >
                                            Advance
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            disabled={!isLastRound || actioningId === a.id}
                                            onClick={() => setOfferingApplicant(a)}
                                        >
                                            Make offer
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            disabled={actioningId === a.id}
                                            onClick={() => handleReject(a)}
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>

                            {a.outcome === "offer" && (
                                <p className={styles.awaitingNote}>
                                    Offer extended — awaiting response
                                    {a.offer_expires_at ? ` by ${formatDateTime(a.offer_expires_at)}` : ""}
                                </p>
                            )}

                            {CLOSED_OUTCOMES.includes(a.outcome) && (
                                <p className={styles.final}>This application is final.</p>
                            )}

                            <button
                                type="button"
                                className={styles.correctLink}
                                onClick={() => setCorrectingApplicant(a)}
                            >
                                Correct a mistake
                            </button>
                        </DriveCard>
                    );
                })}
            </div>

            {correctingApplicant && (
                <CorrectApplicationModal
                    applicant={correctingApplicant}
                    rounds={rounds}
                    onClose={() => setCorrectingApplicant(null)}
                    onCorrected={() => {
                        setCorrectingApplicant(null);
                        setReloadKey((k) => k + 1);
                    }}
                />
            )}

            {offeringApplicant && (
                <OfferDeadlineModal
                    applicant={offeringApplicant}
                    onClose={() => setOfferingApplicant(null)}
                    onOffered={() => {
                        setOfferingApplicant(null);
                        setReloadKey((k) => k + 1);
                    }}
                />
            )}
        </div>
    );
}

export default TrackApplications;