import Panel from "../../dashboard/Panel";
import ReviewActions from "../ReviewActions";
import { formatText, formatDateIST } from "../../../utils/format";
import dash from "../../dashboard/Dashboard.module.css";
import styles from "./AdminHome.module.css";

function PendingDrivesPanel({ drives, onReviewed, onViewAll }) {
    return (
        <Panel
            title="Drives waiting for approval"
            isEmpty={drives.length === 0}
            emptyText="No drives waiting for approval 🎉"
            footer={
                <button type="button" className={dash.linkButton} onClick={onViewAll}>
                    View all pending
                </button>
            }
        >
            <ul className={dash.list}>
                {drives.map((d) => (
                    <li key={d.id} className={styles.row}>
                        <div className={styles.rowTop}>
                            <strong>{d.title}</strong>
                            <span className={styles.typePill}>{d.type}</span>
                        </div>
                        <div className={styles.rowMeta}>
                            {formatText(d.company_name)} · {formatText(d.recruiter_name)}
                        </div>
                        <div className={styles.rowMeta}>Submitted {formatDateIST(d.created_at)}</div>
                        <ReviewActions drive={d} onReviewed={(action) => onReviewed(d.id, action)} />
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

export default PendingDrivesPanel;