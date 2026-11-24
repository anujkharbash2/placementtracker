import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import { usePaginatedDrives, EMPTY_FILTERS } from "../../hooks/usePaginatedDrives";
import { isDriveClosed, formatDeadline, formatDateTime } from "../../utils/driveDates";
import DriveCard from "../common/DriveCard";
import DriveDetails from "../common/DriveDetails";
import DriveFilters from "../common/DriveFilters";
import Pagination from "../common/Pagination";
import StatusBadge from "../common/StatusBadge";
import ReviewActions from "./ReviewActions";
import styles from "./AllDrives.module.css";

const PAGE_SIZE = 10;

function AllDrives({ initialFilters }) {
    const [filters, setFilters] = useState({ ...EMPTY_FILTERS, ...initialFilters });
    const { token } = useAuth();

   
    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
    const [companies, setCompanies] = useState([]);

    const { drives, total, totalPages, loading, error } = usePaginatedDrives(
        "/api/drives",
        filters,
        page,
        PAGE_SIZE,
        refreshKey
    );

    useEffect(() => {
        if (!token) return;

        async function loadCompanies() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/companies`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (!response.ok) return;

                const list = data.companies || data.data || data;
                if (Array.isArray(list)) setCompanies(list);
            } catch (err) {
                // The company filter is optional, so a failure here is not worth surfacing
            }
        }

        loadCompanies();
    }, [token]);

    // If a review empties the last page, step back
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    function handleFilterChange(patch) {
        setFilters((prev) => ({ ...prev, ...patch }));
        setPage(1);
    }

    function handleClear() {
        setFilters(EMPTY_FILTERS);
        setPage(1);
    }

    const hasActiveFilters = Object.values(filters).some((v) => v !== "");

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.heading}>All Drives</h2>

            <DriveFilters
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClear}
                companies={companies}
            />

            {error && <p className={styles.error}>{error}</p>}
            {loading && <p className={styles.note}>Loading drives...</p>}
            {!loading && !error && drives.length === 0 && (
                <p className={styles.note}>
                    {hasActiveFilters ? "No drives match these filters." : "No drives have been posted yet."}
                </p>
            )}

            <div className={styles.list}>
                {drives.map((drive) => (
                    <DriveCard
                        key={drive.id}
                        summary={
                            <div>
                                <h4>{drive.title}</h4>
                                <p>
                                    {drive.company_name} · {drive.type} · Deadline:{" "}
                                    {formatDeadline(drive.application_deadline)}
                                </p>
                                {drive.approval_status === "rejected" && (
                                    <div className={styles.rejection}>
                                        <strong>Rejected:</strong> {drive.rejection_reason || "No reason given."}
                                    </div>
                                )}
                            </div>
                        }
                        badge={
                            <>
                                {isDriveClosed(drive) && <StatusBadge status="closed" label="Closed" />}
                                <StatusBadge status={drive.approval_status} />
                            </>
                        }
                    >
                        <p className={styles.recruiter}>Recruiter: {drive.recruiter_name}</p>

                        <DriveDetails drive={drive} />

                        {drive.approval_status !== "pending" && drive.approved_by_name && (
                            <p className={styles.reviewedBy}>
                                {drive.approval_status === "approved" ? "Approved" : "Rejected"} by{" "}
                                {drive.approved_by_name}
                                {drive.reviewed_at ? ` on ${formatDateTime(drive.reviewed_at)}` : ""}
                            </p>
                        )}

                        {drive.approval_status === "pending" && (
                            <ReviewActions
                                drive={drive}
                                onReviewed={() => setRefreshKey((k) => k + 1)}
                            />
                        )}
                    </DriveCard>
                ))}
            </div>

            {!error && total > 0 && (
                <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
            )}
        </div>
    );
}

export default AllDrives;