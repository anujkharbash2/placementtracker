import Panel from "../../dashboard/Panel";
import { formatText, formatNumber } from "../../../utils/format";
import dash from "../../dashboard/Dashboard.module.css";
import styles from "./RecruiterHome.module.css";

function StaleApplicantsPanel({ applicants, onOpenDrive }) {
    return (
        <Panel
            title="Applicants waiting 7+ days"
            isEmpty={applicants.length === 0}
            emptyText="No applicants are waiting on you 🎉"
        >
            <ul className={dash.list}>
                {applicants.map((a) => (
                    <li key={a.application_id}>
                        <button type="button" className={styles.rowButton} onClick={() => onOpenDrive(a.drive_id)}>
                            <span className={styles.rowTop}>
                                <strong>{formatText(a.student_name)}</strong>
                                <span className={styles.rowMeta}>
                                    waiting {formatNumber(a.days_waiting)} {a.days_waiting === 1 ? "day" : "days"}
                                </span>
                            </span>
                            <span className={styles.rowMeta}>{formatText(a.drive_title)}</span>
                            <span className={styles.rowMeta}>Current round: {formatText(a.current_round_name)}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

export default StaleApplicantsPanel;