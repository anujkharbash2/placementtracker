import Panel from "../../dashboard/Panel";
import { formatText, formatDateTimeIST, expiryHint, isWithinHours } from "../../../utils/format";
import dash from "../../dashboard/Dashboard.module.css";
import styles from "./RecruiterHome.module.css";

function OffersAwaitingPanel({ offers, onOpenDrive }) {
    return (
        <Panel
            title="Offers awaiting student response"
            isEmpty={offers.length === 0}
            emptyText="No offers waiting for a response"
        >
            <ul className={dash.list}>
                {offers.map((o) => {
                    const urgent = isWithinHours(o.offer_expires_at, 24);

                    return (
                        <li key={o.application_id}>
                            <button
                                type="button"
                                className={`${styles.rowButton} ${urgent ? styles.rowUrgent : ""}`}
                                onClick={() => onOpenDrive(o.drive_id)}
                            >
                                <span className={styles.rowTop}>
                                    <strong>{formatText(o.student_name)}</strong>
                                    <span className={styles.rowMeta}>{formatText(o.roll_number)}</span>
                                </span>
                                <span className={styles.rowMeta}>{formatText(o.drive_title)}</span>
                                <span className={styles.rowMeta}>
                                    Respond by {formatDateTimeIST(o.offer_expires_at)} ({expiryHint(o.offer_expires_at)})
                                </span>
                                {urgent && <span className={styles.urgentTag}>Expires within 24 hours</span>}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </Panel>
    );
}

export default OffersAwaitingPanel;