import { useDriveRounds } from "../../hooks/useDriveRounds";
import { getOutcomeBadge } from "../../utils/outcomeBadge";
import { formatDateTime } from "../../utils/driveDates";
import StatusBadge from "../common/StatusBadge";
import ApplicationTracker from "./ApplicationTracker";
import OfferResponse from "./OfferResponse";
import styles from "./ApplicationCard.module.css";

function ApplicationCard({ app, onResolved }) {
    const { rounds, loading, error } = useDriveRounds(app.drive_id);
    const badge = getOutcomeBadge(app);

    const closedNote =
        app.outcome === "withdrawn"
            ? "Withdrawn — you accepted an offer elsewhere."
            : app.outcome === "offer_expired"
            ? "Offer expired — the response deadline passed without a reply."
            : null;

    return (
        <div className={`${styles.card} ${closedNote ? styles.closedCard : ""}`}>
            <div className={styles.header}>
                <div>
                    <h4>{app.title}</h4>
                    <p className={styles.meta}>
                        {app.company_name} · {app.type}
                        {app.job_location ? ` · ${app.job_location}` : ""}
                        {app.package_or_stipend ? ` · ${app.package_or_stipend}` : ""}
                    </p>
                    <p className={styles.meta}>
                        Applied {formatDateTime(app.applied_at)}
                        {app.updated_at && app.updated_at !== app.applied_at
                            ? ` · Last update ${formatDateTime(app.updated_at)}`
                            : ""}
                    </p>
                </div>
                <StatusBadge status={badge.status} label={badge.label} />
            </div>

            {closedNote && <p className={styles.closedNote}>{closedNote}</p>}

            {loading && <p className={styles.roundsNote}>Loading progress...</p>}
            {error && <p className={styles.roundsNote}>{error}</p>}
            {!loading && !error && <ApplicationTracker rounds={rounds} application={app} />}

            {app.outcome === "offer_accepted" && (
                <p className={styles.acceptedNote}>You accepted this offer.</p>
            )}
            {app.outcome === "offer_declined" && (
                <p className={styles.declinedNote}>You declined this offer.</p>
            )}

            {app.outcome === "offer" && (
                <OfferResponse application={app} driveTitle={app.title} onResolved={onResolved} />
            )}
        </div>
    );
}

export default ApplicationCard;