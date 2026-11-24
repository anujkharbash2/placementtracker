import { useState, useEffect } from "react";
import { usePaginatedDrives, EMPTY_FILTERS } from "../../hooks/usePaginatedDrives";
import { isDriveClosed, formatDeadline, formatDateTime } from "../../utils/driveDates";
import DriveCard from "../common/DriveCard";
import DriveDetails from "../common/DriveDetails";
import DriveFilters from "../common/DriveFilters";
import Pagination from "../common/Pagination";
import StatusBadge from "../common/StatusBadge";
import styles from "./MyDrives.module.css";

const PAGE_SIZE = 10;

function MyDrives({ refreshKey, initialFilters }) {
    const [filters, setFilters] = useState({ ...EMPTY_FILTERS, ...initialFilters });
    const [page, setPage] = useState(1);

    const { drives, total, totalPages, loading, error } = usePaginatedDrives(
        "/api/drives/mine",
        filters,
        page,
        PAGE_SIZE,
        refreshKey
    );

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
            <h2 className={styles.heading}>My Drives</h2>

            <DriveFilters filters={filters} onChange={handleFilterChange} onClear={handleClear} />

            {error && <p className={styles.error}>{error}</p>}
            {loading && <p className={styles.note}>Loading your drives...</p>}
            {!loading && !error && drives.length === 0 && (
                <p className={styles.note}>
                    {hasActiveFilters
                        ? "No drives match these filters."
                        : "You haven't posted any drives yet."}
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
                                    {drive.type} · {drive.number_of_openings} openings · Deadline:{" "}
                                    {formatDeadline(drive.application_deadline)}
                                </p>
                                {drive.approval_status === "pending" && (
                                    <div className={styles.awaiting}>Awaiting admin approval</div>
                                )}
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
                        <DriveDetails drive={drive} />

                        {drive.approval_status !== "pending" && drive.approved_by_name && (
                            <p className={styles.reviewedBy}>
                                {drive.approval_status === "approved" ? "Approved" : "Rejected"} by{" "}
                                {drive.approved_by_name}
                                {drive.reviewed_at ? ` on ${formatDateTime(drive.reviewed_at)}` : ""}
                            </p>
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

export default MyDrives;