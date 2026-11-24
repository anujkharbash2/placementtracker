import Panel from "../../dashboard/Panel";
import Button from "../../common/Button";
import { formatText, formatDateIST } from "../../../utils/format";
import dash from "../../dashboard/Dashboard.module.css";
import styles from "./RecruiterHome.module.css";

function RejectedDrivesPanel({ drives, onCreate }) {
    return (
        <Panel title="Rejected drives" isEmpty={drives.length === 0} emptyText="No rejected drives 🎉">
            <ul className={dash.list}>
                {drives.map((d) => (
                    <li key={d.id} className={styles.row}>
                        <strong>{formatText(d.title)}</strong>
                        <p className={styles.reason}>{formatText(d.rejection_reason)}</p>
                        <div className={styles.rowMeta}>Reviewed {formatDateIST(d.reviewed_at)}</div>
                        <div className={styles.rowAction}>
                            <Button type="button" variant="outline" onClick={onCreate}>
                                Create corrected drive
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

export default RejectedDrivesPanel;