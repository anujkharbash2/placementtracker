import Panel from "../../dashboard/Panel";
import { formatText, formatDateTimeIST, expiryHint } from "../../../utils/format";
import dash from "../../dashboard/Dashboard.module.css";
import styles from "./AdminHome.module.css";

function ExpiringOffersPanel({ offers }) {
    return (
        <Panel
            title="Offers expiring in the next 3 days"
            isEmpty={offers.length === 0}
            emptyText="No offers expiring soon"
        >
            <ul className={dash.list}>
                {offers.map((o) => (
                    <li key={o.application_id} className={styles.row}>
                        <div className={styles.rowTop}>
                            <strong>{formatText(o.student_name)}</strong>
                            <span className={styles.rowMeta}>{formatText(o.roll_number)}</span>
                        </div>
                        <div className={styles.rowMeta}>
                            {formatText(o.drive_title)} · {formatText(o.company_name)}
                        </div>
                        <div className={styles.rowMeta}>
                            Expires {formatDateTimeIST(o.offer_expires_at)} ({expiryHint(o.offer_expires_at)})
                        </div>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

export default ExpiringOffersPanel;